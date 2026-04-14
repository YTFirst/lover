(function(global) {
    'use strict';

    var UI = App.UI;
    var Constants = App.Constants;

    var currentGuideStep = 0;

    function checkAndShowGuide() {
        var hasSeenGuide = localStorage.getItem('egfHasSeenGuide');
        if (!hasSeenGuide) {
            showGuide();
        }
    }

    function showGuide() {
        currentGuideStep = 0;
        renderGuideStep();
        renderGuideDots();
        document.getElementById('guide-modal').classList.add('show');
    }

    function renderGuideStep() {
        var container = document.getElementById('guide-steps');
        if (!container) return;

        container.innerHTML = '';

        Constants.GUIDE_STEPS.forEach(function(step, index) {
            var stepDiv = document.createElement('div');
            stepDiv.className = 'guide-step ' + (index === currentGuideStep ? 'active' : '');

            stepDiv.innerHTML =
                '<div class="guide-step-title">' +
                    '<div class="guide-step-icon">' + step.icon + '</div>' +
                    '<span>' + step.title + '</span>' +
                '</div>' +
                '<div class="guide-step-content">' + step.content + '</div>';

            container.appendChild(stepDiv);
        });

        var nextBtn = document.getElementById('guide-next-btn');
        if (nextBtn) {
            if (currentGuideStep === Constants.GUIDE_STEPS.length - 1) {
                nextBtn.textContent = '开始使用';
            } else {
                nextBtn.textContent = '下一步';
            }
        }
    }

    function renderGuideDots() {
        var container = document.getElementById('guide-dots');
        if (!container) return;

        container.innerHTML = '';

        Constants.GUIDE_STEPS.forEach(function(_, index) {
            var dot = document.createElement('div');
            dot.className = 'guide-dot ' + (index === currentGuideStep ? 'active' : '');
            container.appendChild(dot);
        });
    }

    function nextGuideStep() {
        if (currentGuideStep < Constants.GUIDE_STEPS.length - 1) {
            currentGuideStep++;
            renderGuideStep();
            renderGuideDots();
        } else {
            completeGuide();
        }
    }

    function skipGuide() {
        completeGuide();
    }

    function completeGuide() {
        localStorage.setItem('egfHasSeenGuide', 'true');
        document.getElementById('guide-modal').classList.remove('show');
        UI.showToast('开始你的虚拟女友之旅吧！');
    }

    async function checkForUpdates() {
        var statusElement = document.getElementById('update-check-status');

        try {
            await new Promise(function(resolve) { setTimeout(resolve, 1000); });

            var latestVersion = '1.0.0';

            if (latestVersion !== Constants.APP_VERSION) {
                if (statusElement) {
                    statusElement.innerHTML = '<span style="color: var(--secondary-color);"> · 有新版本 ' + latestVersion + '</span>';
                }
                showUpdateNotification(latestVersion);
            } else {
                if (statusElement) {
                    statusElement.innerHTML = '<span style="color: var(--gray-medium);"> · 已是最新版本</span>';
                }
            }
        } catch (error) {
            console.error('检查更新失败:', error);
            if (statusElement) {
                statusElement.innerHTML = '<span style="color: var(--gray-medium);"> · 检查更新失败</span>';
            }
        }
    }

    function showUpdateNotification(latestVersion) {
        console.log('发现新版本: ' + latestVersion);
    }

    var Guide = {
        checkAndShowGuide: checkAndShowGuide,
        showGuide: showGuide,
        renderGuideStep: renderGuideStep,
        renderGuideDots: renderGuideDots,
        nextGuideStep: nextGuideStep,
        skipGuide: skipGuide,
        completeGuide: completeGuide,
        checkForUpdates: checkForUpdates,
        showUpdateNotification: showUpdateNotification
    };

    global.App = global.App || {};
    global.App.Guide = Guide;

    global.checkAndShowGuide = checkAndShowGuide;
    global.showGuide = showGuide;
    global.nextGuideStep = nextGuideStep;
    global.skipGuide = skipGuide;
    global.completeGuide = completeGuide;
    global.checkForUpdates = checkForUpdates;

})(window);
