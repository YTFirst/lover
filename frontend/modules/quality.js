(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;

    function rateMessage(messageId, type) {
        var ratings = Store.getRef('ratings');
        var existingRating = ratings.find(function(r) { return r.messageId === messageId; });
        if (existingRating) {
            UI.showToast('该消息已评价');
            return;
        }

        var messages = Store.getRef('messages');
        var message = messages.find(function(m) { return m.id === messageId; });
        if (!message) {
            var sessions = Store.getRef('sessions');
            for (var i = 0; i < sessions.length; i++) {
                if (sessions[i].messages) {
                    var found = sessions[i].messages.find(function(m) { return m.id === messageId; });
                    if (found) {
                        message = found;
                        break;
                    }
                }
            }
        }

        var rating = {
            id: Date.now(),
            messageId: messageId,
            type: type,
            content: message ? message.content.substring(0, 100) : '',
            timestamp: new Date().toISOString(),
            sessionId: Store.getRef('currentSessionId'),
            agentId: Store.getRef('currentAgentId')
        };

        ratings.push(rating);
        Store.setState('ratings', ratings);
        App.Storage.save();

        var ratingBtn = document.querySelector('.rating-btn[onclick*="' + messageId + '"][onclick*="' + type + '"]');
        if (ratingBtn) {
            ratingBtn.classList.add('active');

            createRatingParticles(ratingBtn, type);
        }

        UI.showToast(type === 'positive' ? '感谢您的反馈！' : '感谢您的反馈，我们会改进');
    }

    function createRatingParticles(button, type) {
        var rect = button.getBoundingClientRect();
        var colors = type === 'positive'
            ? ['#48BB78', '#68D391', '#9AE6B4', '#C6F6D5']
            : ['#F56565', '#FC8181', '#FEB2B2', '#FED7D7'];

        for (var i = 0; i < 8; i++) {
            var particle = document.createElement('div');
            particle.className = 'rating-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = rect.left + rect.width / 2 + 'px';
            particle.style.top = rect.top + rect.height / 2 + 'px';

            var angle = (i / 8) * Math.PI * 2;
            var distance = 30 + Math.random() * 20;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

            document.body.appendChild(particle);

            setTimeout(function(p) {
                return function() { p.remove(); };
            }(particle), 600);
        }
    }

    function calculateQualityStats() {
        var ratings = Store.getRef('ratings');

        var total = ratings.length;
        var positive = ratings.filter(function(r) { return r.type === 'positive'; }).length;
        var negative = ratings.filter(function(r) { return r.type === 'negative'; }).length;
        var rating = total > 0 ? Math.round((positive / total) * 100) : 0;

        return {
            total: total,
            positive: positive,
            negative: negative,
            rating: rating
        };
    }

    function getRatingTrend() {
        var trend = [];
        var now = new Date();
        var ratings = Store.getRef('ratings');

        for (var i = 6; i >= 0; i--) {
            var date = new Date(now);
            date.setDate(date.getDate() - i);
            var dateStr = date.toISOString().split('T')[0];

            var dayRatings = ratings.filter(function(r) {
                return r.timestamp.startsWith(dateStr);
            });

            var total = dayRatings.length;
            var positive = dayRatings.filter(function(r) { return r.type === 'positive'; }).length;
            var rating = total > 0 ? Math.round((positive / total) * 100) : 0;

            trend.push({
                date: dateStr,
                rating: rating,
                total: total,
                positive: positive,
                negative: total - positive
            });
        }

        return trend;
    }

    function detectLowQualityResponses() {
        var alerts = [];
        var ratings = Store.getRef('ratings');
        var recentRatings = ratings.slice(-20);

        var consecutiveNegatives = 0;
        for (var i = recentRatings.length - 1; i >= 0; i--) {
            if (recentRatings[i].type === 'negative') {
                consecutiveNegatives++;
            } else {
                break;
            }
        }

        if (consecutiveNegatives >= 3) {
            alerts.push({
                type: 'consecutive_negatives',
                message: '检测到连续 ' + consecutiveNegatives + ' 条差评，请检查回复质量',
                severity: 'high',
                timestamp: new Date().toISOString()
            });
        }

        var recentNegativeRate = recentRatings.length > 0
            ? recentRatings.filter(function(r) { return r.type === 'negative'; }).length / recentRatings.length
            : 0;

        if (recentNegativeRate > 0.5 && recentRatings.length >= 5) {
            alerts.push({
                type: 'high_negative_rate',
                message: '最近' + recentRatings.length + '条评价中差评率超过50%，需要关注',
                severity: 'medium',
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    }

    function renderQualityStats() {
        var stats = calculateQualityStats();

        document.getElementById('overall-rating').textContent = stats.rating + '%';
        document.getElementById('total-ratings').textContent = stats.total;
        document.getElementById('positive-count').textContent = stats.positive;
        document.getElementById('negative-count').textContent = stats.negative;

        renderQualityTrendChart();

        renderLowQualityAlerts();

        renderRecentRatings();
    }

    function renderQualityTrendChart() {
        var canvas = document.getElementById('quality-trend-chart');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        var trend = getRatingTrend();

        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 200;

        var width = canvas.width;
        var height = canvas.height;
        var padding = 40;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        for (var i = 0; i <= 4; i++) {
            var y = padding + (height - 2 * padding) * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            ctx.fillStyle = '#a0aec0';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText((100 - i * 25) + '%', padding - 10, y + 4);
        }

        if (trend.length > 0) {
            var stepX = (width - 2 * padding) / (trend.length - 1 || 1);

            ctx.strokeStyle = '#FF6B9D';
            ctx.lineWidth = 2;
            ctx.beginPath();

            trend.forEach(function(data, index) {
                var x = padding + index * stepX;
                var y = padding + (height - 2 * padding) * (1 - data.rating / 100);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            trend.forEach(function(data, index) {
                var x = padding + index * stepX;
                var y = padding + (height - 2 * padding) * (1 - data.rating / 100);

                ctx.fillStyle = '#FF6B9D';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#a0aec0';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                var dateLabel = data.date.substring(5);
                ctx.fillText(dateLabel, x, height - padding + 20);
            });
        }
    }

    function renderLowQualityAlerts() {
        var container = document.getElementById('low-quality-alerts');
        if (!container) return;

        var alerts = detectLowQualityResponses();

        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">暂无低质量提醒</div>';
            return;
        }

        container.innerHTML = '';

        alerts.forEach(function(alert) {
            var alertDiv = document.createElement('div');
            alertDiv.className = 'quality-alert ' + alert.severity;

            var icon = alert.severity === 'high' ? '⚠️' : 'ℹ️';

            alertDiv.innerHTML =
                '<div class="alert-icon">' + icon + '</div>' +
                '<div class="alert-content">' +
                    '<div class="alert-message">' + alert.message + '</div>' +
                    '<div class="alert-time">' + UI.formatDateTime(alert.timestamp) + '</div>' +
                '</div>';

            container.appendChild(alertDiv);
        });
    }

    function renderRecentRatings() {
        var container = document.getElementById('recent-ratings-list');
        if (!container) return;

        var ratings = Store.getRef('ratings');
        var recentRatings = ratings.slice(-20).reverse();

        if (recentRatings.length === 0) {
            container.innerHTML = '<div class="no-ratings">暂无评价记录</div>';
            return;
        }

        container.innerHTML = '';

        recentRatings.forEach(function(rating) {
            var ratingDiv = document.createElement('div');
            ratingDiv.className = 'rating-item';

            var icon = rating.type === 'positive' ? '👍' : '👎';
            var typeText = rating.type === 'positive' ? '好评' : '差评';

            ratingDiv.innerHTML =
                '<div class="rating-icon">' + icon + '</div>' +
                '<div class="rating-content">' +
                    '<div class="rating-text">' + UI.escapeHtml(rating.content) + '</div>' +
                    '<div class="rating-meta">' +
                        '<span class="rating-type">' + typeText + '</span>' +
                        '<span class="rating-time">' + UI.formatDateTime(rating.timestamp) + '</span>' +
                    '</div>' +
                '</div>';

            container.appendChild(ratingDiv);
        });
    }

    var Quality = {
        rateMessage: rateMessage,
        createRatingParticles: createRatingParticles,
        calculateQualityStats: calculateQualityStats,
        getRatingTrend: getRatingTrend,
        detectLowQualityResponses: detectLowQualityResponses,
        renderQualityStats: renderQualityStats,
        renderQualityTrendChart: renderQualityTrendChart,
        renderLowQualityAlerts: renderLowQualityAlerts,
        renderRecentRatings: renderRecentRatings
    };

    global.App = global.App || {};
    global.App.Quality = Quality;

    global.rateMessage = rateMessage;
    global.renderQualityStats = renderQualityStats;

})(window);
