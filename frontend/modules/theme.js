(function(global) {
    'use strict';

    var UI = App.UI;

    var currentThemeConfig = null;

    function loadThemeConfig() {
        var saved = localStorage.getItem('egfThemeConfig');
        if (saved) {
            return JSON.parse(saved);
        }
        return JSON.parse(JSON.stringify(App.Constants.DEFAULT_THEME_CONFIG));
    }

    function saveThemeConfigToStorage(config) {
        localStorage.setItem('egfThemeConfig', JSON.stringify(config));
    }

    function applyThemeConfig(config) {
        var root = document.documentElement;

        if (config.colors) {
            root.style.setProperty('--primary-color', config.colors.primary);
            root.style.setProperty('--primary-light', config.colors.primaryLight);
            root.style.setProperty('--primary-dark', config.colors.primaryDark);
            root.style.setProperty('--secondary-color', config.colors.secondary);
            root.style.setProperty('--secondary-light', config.colors.secondaryLight);
            root.style.setProperty('--secondary-dark', config.colors.secondaryDark);
            root.style.setProperty('--background', config.colors.background);
        }

        updatePreviewBox(config);
    }

    function updatePreviewBox(config) {
        var previewBox = document.getElementById('ui-preview-box');
        if (!previewBox) return;

        var header = previewBox.querySelector('.theme-preview-header');
        var primaryBtn = previewBox.querySelector('.theme-preview-button:not(.secondary)');
        var secondaryBtn = previewBox.querySelector('.theme-preview-button.secondary');

        if (header && config.colors) {
            header.style.backgroundColor = config.colors.primary;
        }
        if (primaryBtn && config.colors) {
            primaryBtn.style.backgroundColor = config.colors.primary;
        }
        if (secondaryBtn && config.colors) {
            secondaryBtn.style.backgroundColor = config.colors.secondary;
        }
    }

    function updateThemeInputs(config) {
        if (!config || !config.colors) return;

        var colorMap = {
            'primary': config.colors.primary,
            'secondary': config.colors.secondary,
            'background': config.colors.background
        };

        Object.keys(colorMap).forEach(function(key) {
            var picker = document.getElementById('theme-color-' + key);
            var textInput = document.getElementById('theme-color-' + key + '-text');
            if (picker) picker.value = colorMap[key];
            if (textInput) textInput.value = colorMap[key];
        });
    }

    function lightenColor(hex, percent) {
        var num = parseInt(hex.replace('#', ''), 16);
        var amt = Math.round(2.55 * percent);
        var R = Math.min(255, (num >> 16) + amt);
        var G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        var B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase();
    }

    function darkenColor(hex, percent) {
        var num = parseInt(hex.replace('#', ''), 16);
        var amt = Math.round(2.55 * percent);
        var R = Math.max(0, (num >> 16) - amt);
        var G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        var B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase();
    }

    function updateThemeColor(colorType, value) {
        if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            UI.showToast('请输入有效的颜色值（如 #FF6B9D）');
            return;
        }

        var picker = document.getElementById('theme-color-' + colorType);
        var textInput = document.getElementById('theme-color-' + colorType + '-text');

        if (picker) picker.value = value;
        if (textInput) textInput.value = value;

        if (!currentThemeConfig) {
            currentThemeConfig = JSON.parse(JSON.stringify(App.Constants.DEFAULT_THEME_CONFIG));
        }

        currentThemeConfig.colors[colorType] = value;

        if (colorType === 'primary') {
            currentThemeConfig.colors.primaryLight = lightenColor(value, 30);
            currentThemeConfig.colors.primaryDark = darkenColor(value, 20);
        } else if (colorType === 'secondary') {
            currentThemeConfig.colors.secondaryLight = lightenColor(value, 30);
            currentThemeConfig.colors.secondaryDark = darkenColor(value, 20);
        }

        applyThemeConfig(currentThemeConfig);
    }

    function renderPresetThemes() {
        var container = document.getElementById('preset-themes-grid');
        if (!container) return;

        container.innerHTML = '';

        var presetThemes = App.Constants.PRESET_THEMES;
        presetThemes.forEach(function(theme) {
            var card = document.createElement('div');
            card.className = 'preset-theme-card ' + (currentThemeConfig && currentThemeConfig.id === theme.id ? 'active' : '');
            card.onclick = function() { applyPresetTheme(theme); };

            card.innerHTML =
                '<div class="preset-theme-preview">' +
                    '<div class="preset-theme-color" style="background-color: ' + theme.colors.primary + '"></div>' +
                    '<div class="preset-theme-color" style="background-color: ' + theme.colors.secondary + '"></div>' +
                    '<div class="preset-theme-color" style="background-color: ' + theme.colors.background + '"></div>' +
                '</div>' +
                '<div class="preset-theme-name">' + theme.name + '</div>';

            container.appendChild(card);
        });
    }

    function applyPresetTheme(theme) {
        currentThemeConfig = JSON.parse(JSON.stringify(theme));
        currentThemeConfig.fontSize = currentThemeConfig.fontSize || 'medium';

        updateThemeInputs(currentThemeConfig);
        applyThemeConfig(currentThemeConfig);
        renderPresetThemes();

        UI.showToast('已选择主题: ' + theme.name);
    }

    function updateFontSizeButtons(activeSize) {
        document.querySelectorAll('.font-size-btn').forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.dataset.size === activeSize) {
                btn.classList.add('active');
            }
        });
    }

    function applyFontSize(size) {
        var root = document.documentElement;
        var fontSizes = {
            small: { base: '14px', sm: '12px', lg: '16px', xl: '18px' },
            medium: { base: '16px', sm: '14px', lg: '18px', xl: '20px' },
            large: { base: '18px', sm: '16px', lg: '20px', xl: '24px' }
        };

        var sizes = fontSizes[size] || fontSizes.medium;
        root.style.setProperty('--font-base', sizes.base);
        root.style.setProperty('--font-sm', sizes.sm);
        root.style.setProperty('--font-lg', sizes.lg);
        root.style.setProperty('--font-xl', sizes.xl);
    }

    function setFontSize(size) {
        if (!currentThemeConfig) {
            currentThemeConfig = JSON.parse(JSON.stringify(App.Constants.DEFAULT_THEME_CONFIG));
        }

        currentThemeConfig.fontSize = size;
        updateFontSizeButtons(size);
        applyFontSize(size);
    }

    function saveThemeConfig() {
        if (!currentThemeConfig) {
            currentThemeConfig = JSON.parse(JSON.stringify(App.Constants.DEFAULT_THEME_CONFIG));
        }

        saveThemeConfigToStorage(currentThemeConfig);
        UI.showToast('主题配置已保存');
    }

    function resetThemeConfig() {
        currentThemeConfig = JSON.parse(JSON.stringify(App.Constants.DEFAULT_THEME_CONFIG));

        updateThemeInputs(currentThemeConfig);
        applyThemeConfig(currentThemeConfig);
        renderPresetThemes();
        updateFontSizeButtons('medium');
        applyFontSize('medium');

        UI.showToast('已重置为默认主题');
    }

    function initThemeEditor() {
        currentThemeConfig = loadThemeConfig();
        updateThemeInputs(currentThemeConfig);
        renderPresetThemes();
        applyThemeConfig(currentThemeConfig);
        updateFontSizeButtons(currentThemeConfig.fontSize || 'medium');
    }

    var Theme = {
        updateThemeColor: updateThemeColor,
        setFontSize: setFontSize,
        saveThemeConfig: saveThemeConfig,
        resetThemeConfig: resetThemeConfig,
        renderPresetThemes: renderPresetThemes,
        applyPresetTheme: applyPresetTheme,
        initThemeEditor: initThemeEditor,
        loadThemeConfig: loadThemeConfig,
        applyThemeConfig: applyThemeConfig,
        applyFontSize: applyFontSize
    };

    global.App = global.App || {};
    global.App.Theme = Theme;

    global.updateThemeColor = updateThemeColor;
    global.setFontSize = setFontSize;
    global.saveThemeConfig = saveThemeConfig;
    global.resetThemeConfig = resetThemeConfig;
    global.renderPresetThemes = renderPresetThemes;
    global.applyPresetTheme = applyPresetTheme;

})(window);
