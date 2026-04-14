(function(global) {
    'use strict';

    var Constants = App.Constants;

    function renderPlatformList() {
        var platformList = document.getElementById('platform-list');
        platformList.innerHTML = '';

        Constants.PLATFORMS.forEach(function(platform) {
            var platformElement = createPlatformElement(platform);
            platformList.appendChild(platformElement);
        });
    }

    function createPlatformElement(platform) {
        var platformDiv = document.createElement('div');
        platformDiv.className = 'platform-card';
        platformDiv.dataset.id = platform.id;

        var tagsHtml = platform.tags.map(function(tag) { return '<span class="tag">' + tag + '</span>'; }).join('');

        var stepsHtml = platform.steps.map(function(step) {
            return '<div class="tutorial-step">' +
                '<div class="step-title">' + step.title + '</div>' +
                '<div class="step-content">' +
                    '<ol>' +
                        step.content.map(function(item) { return '<li>' + item + '</li>'; }).join('') +
                    '</ol>' +
                '</div>' +
            '</div>';
        }).join('');

        platformDiv.innerHTML =
            '<div class="platform-header">' +
                '<div class="platform-logo">' + platform.logo + '</div>' +
                '<div class="platform-info">' +
                    '<div class="platform-name">' + platform.name + '</div>' +
                    '<div class="platform-quota">' + platform.quota + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="platform-tags">' + tagsHtml + '</div>' +
            '<button class="tutorial-toggle" onclick="toggleTutorial(\'' + platform.id + '\')">' +
                '<span>查看教程</span>' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<polyline points="6 9 12 15 18 9"/>' +
                '</svg>' +
            '</button>' +
            '<div class="tutorial-steps" id="tutorial-' + platform.id + '">' +
                stepsHtml +
                '<div class="tutorial-actions">' +
                    '<a href="' + platform.registerUrl + '" target="_blank" class="button button-primary">' +
                        '前往注册' +
                    '</a>' +
                    '<button class="button button-secondary" onclick="navigateTo(\'settings\')">' +
                        '返回设置' +
                    '</button>' +
                '</div>' +
            '</div>';

        return platformDiv;
    }

    function toggleTutorial(platformId) {
        var tutorialSteps = document.getElementById('tutorial-' + platformId);
        var toggleButton = tutorialSteps.previousElementSibling;

        if (tutorialSteps.classList.contains('show')) {
            tutorialSteps.classList.remove('show');
            toggleButton.classList.remove('expanded');
        } else {
            document.querySelectorAll('.tutorial-steps.show').forEach(function(el) {
                el.classList.remove('show');
                el.previousElementSibling.classList.remove('expanded');
            });

            tutorialSteps.classList.add('show');
            toggleButton.classList.add('expanded');
        }
    }

    var Tutorial = {
        renderPlatformList: renderPlatformList,
        createPlatformElement: createPlatformElement,
        toggleTutorial: toggleTutorial
    };

    global.App = global.App || {};
    global.App.Tutorial = Tutorial;

    global.toggleTutorial = toggleTutorial;

})(window);
