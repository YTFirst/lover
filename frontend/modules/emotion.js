(function(global) {
    'use strict';

    var Store = App.Store;
    var Constants = App.Constants;

    var EmotionAnalysisState = {
        currentRange: 7,
        emotionData: null
    };

    function analyzeMessageEmotion(message) {
        var content = message.content.toLowerCase();
        var positiveScore = 0;
        var negativeScore = 0;
        var neutralScore = 0;
        var matchedKeywords = {
            positive: [],
            negative: [],
            neutral: []
        };

        Constants.EMOTION_KEYWORDS.positive.forEach(function(keyword) {
            if (content.includes(keyword)) {
                positiveScore++;
                matchedKeywords.positive.push(keyword);
            }
        });

        Constants.EMOTION_KEYWORDS.negative.forEach(function(keyword) {
            if (content.includes(keyword)) {
                negativeScore++;
                matchedKeywords.negative.push(keyword);
            }
        });

        Constants.EMOTION_KEYWORDS.neutral.forEach(function(keyword) {
            if (content.includes(keyword)) {
                neutralScore++;
                matchedKeywords.neutral.push(keyword);
            }
        });

        var emotion = 'neutral';
        if (positiveScore > negativeScore && positiveScore > neutralScore) {
            emotion = 'positive';
        } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
            emotion = 'negative';
        }

        return {
            emotion: emotion,
            scores: {
                positive: positiveScore,
                negative: negativeScore,
                neutral: neutralScore
            },
            keywords: matchedKeywords
        };
    }

    function analyzeEmotionData(days) {
        var now = new Date();
        var startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        var allMessages = [];
        var sessions = Store.getRef('sessions');
        sessions.forEach(function(session) {
            if (session.messages) {
                session.messages.forEach(function(msg) {
                    var msgDate = new Date(msg.timestamp);
                    if (msgDate >= startDate && msg.type === 'user') {
                        allMessages.push({
                            content: msg.content,
                            timestamp: msg.timestamp,
                            type: msg.type,
                            sessionName: session.name
                        });
                    }
                });
            }
        });

        var dailyEmotions = {};
        var emotionDistribution = {
            positive: 0,
            negative: 0,
            neutral: 0
        };
        var allKeywords = {
            positive: {},
            negative: {},
            neutral: {}
        };

        allMessages.forEach(function(msg) {
            var dateKey = new Date(msg.timestamp).toISOString().split('T')[0];
            var analysis = analyzeMessageEmotion(msg);

            emotionDistribution[analysis.emotion]++;

            if (!dailyEmotions[dateKey]) {
                dailyEmotions[dateKey] = {
                    positive: 0,
                    negative: 0,
                    neutral: 0,
                    total: 0
                };
            }
            dailyEmotions[dateKey][analysis.emotion]++;
            dailyEmotions[dateKey].total++;

            ['positive', 'negative', 'neutral'].forEach(function(type) {
                analysis.keywords[type].forEach(function(keyword) {
                    if (!allKeywords[type][keyword]) {
                        allKeywords[type][keyword] = 0;
                    }
                    allKeywords[type][keyword]++;
                });
            });
        });

        return {
            totalMessages: allMessages.length,
            distribution: emotionDistribution,
            dailyEmotions: dailyEmotions,
            keywords: allKeywords
        };
    }

    function updateEmotionRange(days) {
        EmotionAnalysisState.currentRange = days;

        document.querySelectorAll('.time-btn').forEach(function(btn) {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.range) === days) {
                btn.classList.add('active');
            }
        });

        renderEmotionAnalysis();
    }

    function renderEmotionAnalysis() {
        var data = analyzeEmotionData(EmotionAnalysisState.currentRange);
        EmotionAnalysisState.emotionData = data;

        renderEmotionSummary(data);
        renderEmotionDistribution(data);
        renderEmotionTrend(data);
        renderEmotionKeywords(data);
    }

    function renderEmotionSummary(data) {
        var container = document.getElementById('emotion-summary');
        if (!container) return;

        var total = data.totalMessages;
        if (total === 0) {
            container.innerHTML =
                '<div class="emotion-empty">' +
                    '<p>暂无足够的数据进行分析</p>' +
                    '<p class="hint-text">继续与小雅聊天，积累更多对话后即可查看情绪分析</p>' +
                '</div>';
            return;
        }

        var positivePercent = ((data.distribution.positive / total) * 100).toFixed(1);
        var negativePercent = ((data.distribution.negative / total) * 100).toFixed(1);
        var neutralPercent = ((data.distribution.neutral / total) * 100).toFixed(1);

        var mainEmotion = '中性';
        var mainEmoji = '😐';

        if (data.distribution.positive >= data.distribution.negative &&
            data.distribution.positive >= data.distribution.neutral) {
            mainEmotion = '积极';
            mainEmoji = '😊';
        } else if (data.distribution.negative >= data.distribution.positive &&
                   data.distribution.negative >= data.distribution.neutral) {
            mainEmotion = '消极';
            mainEmoji = '😔';
        }

        container.innerHTML =
            '<div class="summary-main">' +
                '<div class="summary-emoji">' + mainEmoji + '</div>' +
                '<div class="summary-info">' +
                    '<div class="summary-title">主要情绪：' + mainEmotion + '</div>' +
                    '<div class="summary-desc">基于 ' + total + ' 条消息的分析</div>' +
                '</div>' +
            '</div>' +
            '<div class="summary-stats">' +
                '<div class="stat-item positive">' +
                    '<div class="stat-label">积极情绪</div>' +
                    '<div class="stat-value">' + positivePercent + '%</div>' +
                    '<div class="stat-bar">' +
                        '<div class="stat-fill" style="width: ' + positivePercent + '%"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-item negative">' +
                    '<div class="stat-label">消极情绪</div>' +
                    '<div class="stat-value">' + negativePercent + '%</div>' +
                    '<div class="stat-bar">' +
                        '<div class="stat-fill" style="width: ' + negativePercent + '%"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-item neutral">' +
                    '<div class="stat-label">中性情绪</div>' +
                    '<div class="stat-value">' + neutralPercent + '%</div>' +
                    '<div class="stat-bar">' +
                        '<div class="stat-fill" style="width: ' + neutralPercent + '%"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function renderEmotionDistribution(data) {
        var container = document.getElementById('emotion-distribution');
        if (!container) return;

        var total = data.totalMessages;
        if (total === 0) {
            container.innerHTML = '<div class="emotion-empty">暂无数据</div>';
            return;
        }

        var positivePercent = (data.distribution.positive / total) * 100;
        var negativePercent = (data.distribution.negative / total) * 100;
        var neutralPercent = (data.distribution.neutral / total) * 100;

        container.innerHTML =
            '<div class="distribution-chart">' +
                '<div class="pie-chart">' +
                    '<div class="pie-segment positive" style="transform: rotate(0deg) skewY(' + (90 - positivePercent * 3.6) + 'deg)"></div>' +
                    '<div class="pie-segment negative" style="transform: rotate(' + (positivePercent * 3.6) + 'deg) skewY(' + (90 - negativePercent * 3.6) + 'deg)"></div>' +
                    '<div class="pie-segment neutral" style="transform: rotate(' + ((positivePercent + negativePercent) * 3.6) + 'deg) skewY(' + (90 - neutralPercent * 3.6) + 'deg)"></div>' +
                    '<div class="pie-center"></div>' +
                '</div>' +
            '</div>' +
            '<div class="distribution-legend">' +
                '<div class="legend-item">' +
                    '<div class="legend-color positive"></div>' +
                    '<span>积极 (' + data.distribution.positive + ')</span>' +
                '</div>' +
                '<div class="legend-item">' +
                    '<div class="legend-color negative"></div>' +
                    '<span>消极 (' + data.distribution.negative + ')</span>' +
                '</div>' +
                '<div class="legend-item">' +
                    '<div class="legend-color neutral"></div>' +
                    '<span>中性 (' + data.distribution.neutral + ')</span>' +
                '</div>' +
            '</div>';
    }

    function renderEmotionTrend(data) {
        var container = document.getElementById('emotion-trend');
        if (!container) return;

        var dates = Object.keys(data.dailyEmotions).sort();

        if (dates.length === 0) {
            container.innerHTML = '<div class="emotion-empty">暂无数据</div>';
            return;
        }

        var recentDates = dates.slice(-EmotionAnalysisState.currentRange);

        var maxValue = 0;
        recentDates.forEach(function(date) {
            var dayData = data.dailyEmotions[date];
            var dayMax = Math.max(dayData.positive, dayData.negative, dayData.neutral);
            if (dayMax > maxValue) maxValue = dayMax;
        });

        if (maxValue === 0) maxValue = 1;

        var barsHtml = '';
        recentDates.forEach(function(date) {
            var dayData = data.dailyEmotions[date];
            var dateLabel = new Date(date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });

            barsHtml +=
                '<div class="trend-day">' +
                    '<div class="trend-bars">' +
                        '<div class="trend-bar positive" style="height: ' + ((dayData.positive / maxValue) * 100) + '%" title="积极: ' + dayData.positive + '"></div>' +
                        '<div class="trend-bar negative" style="height: ' + ((dayData.negative / maxValue) * 100) + '%" title="消极: ' + dayData.negative + '"></div>' +
                        '<div class="trend-bar neutral" style="height: ' + ((dayData.neutral / maxValue) * 100) + '%" title="中性: ' + dayData.neutral + '"></div>' +
                    '</div>' +
                    '<div class="trend-label">' + dateLabel + '</div>' +
                '</div>';
        });

        container.innerHTML =
            '<div class="trend-chart">' +
                barsHtml +
            '</div>' +
            '<div class="trend-legend">' +
                '<div class="legend-item">' +
                    '<div class="legend-color positive"></div>' +
                    '<span>积极</span>' +
                '</div>' +
                '<div class="legend-item">' +
                    '<div class="legend-color negative"></div>' +
                    '<span>消极</span>' +
                '</div>' +
                '<div class="legend-item">' +
                    '<div class="legend-color neutral"></div>' +
                    '<span>中性</span>' +
                '</div>' +
            '</div>';
    }

    function renderEmotionKeywords(data) {
        var container = document.getElementById('emotion-keywords');
        if (!container) return;

        var keywordsHtml = [];

        ['positive', 'negative', 'neutral'].forEach(function(type) {
            var keywords = data.keywords[type];
            var keywordArray = Object.entries(keywords).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5);

            if (keywordArray.length > 0) {
                var typeNames = {
                    positive: '积极关键词',
                    negative: '消极关键词',
                    neutral: '中性关键词'
                };

                var keywordsList = keywordArray.map(function(entry) {
                    return '<span class="keyword-tag ' + type + '">' + entry[0] + ' (' + entry[1] + ')</span>';
                }).join('');

                keywordsHtml.push(
                    '<div class="keyword-group">' +
                        '<div class="keyword-type">' + typeNames[type] + '</div>' +
                        '<div class="keyword-list">' + keywordsList + '</div>' +
                    '</div>'
                );
            }
        });

        if (keywordsHtml.length === 0) {
            container.innerHTML = '<div class="emotion-empty">暂无关键词数据</div>';
        } else {
            container.innerHTML = keywordsHtml.join('');
        }
    }

    function initEmotionAnalysis() {
        renderEmotionAnalysis();
    }

    var Emotion = {
        analyzeMessageEmotion: analyzeMessageEmotion,
        analyzeEmotionData: analyzeEmotionData,
        updateEmotionRange: updateEmotionRange,
        renderEmotionAnalysis: renderEmotionAnalysis,
        renderEmotionSummary: renderEmotionSummary,
        renderEmotionDistribution: renderEmotionDistribution,
        renderEmotionTrend: renderEmotionTrend,
        renderEmotionKeywords: renderEmotionKeywords,
        initEmotionAnalysis: initEmotionAnalysis
    };

    global.App = global.App || {};
    global.App.Emotion = Emotion;

    global.updateEmotionRange = updateEmotionRange;

})(window);
