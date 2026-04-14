(function(global) {
    'use strict';

    var UI = App.UI;

    var currentCharacterId = localStorage.getItem('egfCurrentCharacter') || 'female_adventurer';

    function setCharacterAnimation(action) {
        var character = document.getElementById('pixel-character');
        var characterImage = document.getElementById('character-image');
        var previewImage = document.getElementById('preview-character-image');

        character.className = 'pixel-character';
        character.classList.add('animate-' + action);

        var imagePath = null;
        if (typeof getCharacterImage === 'function') {
            imagePath = getCharacterImage(currentCharacterId, action);
        }

        if (characterImage && imagePath) {
            characterImage.src = imagePath;
        }
        if (previewImage && imagePath) {
            previewImage.src = imagePath;
        }

        var nonLoopActions = ['happy', 'sad', 'hug', 'wave', 'surprised', 'confused'];
        if (nonLoopActions.indexOf(action) !== -1) {
            setTimeout(function() {
                character.classList.remove('animate-' + action);
                character.classList.add('animate-idle');

                var idlePath = null;
                if (typeof getCharacterImage === 'function') {
                    idlePath = getCharacterImage(currentCharacterId, 'idle');
                }
                if (characterImage) characterImage.src = idlePath;
                if (previewImage) previewImage.src = idlePath;
            }, 3000);
        }
    }

    function setCurrentCharacter(characterId) {
        currentCharacterId = characterId;
        localStorage.setItem('egfCurrentCharacter', characterId);

        var character = document.getElementById('pixel-character');
        if (character) {
            character.classList.add('entering');
            setTimeout(function() {
                character.classList.remove('entering');
                setCharacterAnimation('idle');
            }, 500);
        } else {
            setCharacterAnimation('idle');
        }
    }

    function handleCharacterImageUpload(event) {
        var file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            UI.showToast('请选择图片文件');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            UI.showToast('图片大小不能超过5MB');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var imageData = e.target.result;
            localStorage.setItem('egfCharacterImage', imageData);
            showCustomImagePreview(imageData);

            var mainImage = document.getElementById('character-image');
            var previewImage = document.getElementById('preview-character-image');
            if (mainImage) mainImage.src = imageData;
            if (previewImage) previewImage.src = imageData;

            UI.showToast('图片已上传');
        };
        reader.onerror = function() {
            UI.showToast('图片读取失败');
        };
        reader.readAsDataURL(file);

        event.target.value = '';
    }

    function showCustomImagePreview(imageData) {
        var previewContainer = document.getElementById('custom-image-preview');
        var imageElement = document.getElementById('custom-character-image');
        var uploadArea = document.querySelector('.upload-area');

        if (previewContainer && imageElement) {
            imageElement.src = imageData;
            previewContainer.style.display = 'block';
        }

        if (uploadArea) {
            uploadArea.style.display = 'none';
        }
    }

    function hideCustomImagePreview() {
        var previewContainer = document.getElementById('custom-image-preview');
        var uploadArea = document.querySelector('.upload-area');

        if (previewContainer) {
            previewContainer.style.display = 'none';
        }

        if (uploadArea) {
            uploadArea.style.display = 'block';
        }
    }

    function removeCustomCharacterImage() {
        localStorage.removeItem('egfCharacterImage');
        hideCustomImagePreview();
        updateCharacterPreview();
        UI.showToast('已移除自定义图片');
    }

    function renderCharacterOptions() {
        var container = document.getElementById('character-options-grid');
        if (!container) return;

        container.innerHTML = '';

        var characters = [];
        if (typeof getCharacterList === 'function') {
            characters = getCharacterList();
        }

        characters.forEach(function(char) {
            var card = document.createElement('div');
            card.className = 'character-option-card ' + (currentCharacterId === char.id ? 'active' : '');
            card.onclick = function() { selectCharacter(char.id); };

            // Use WebP preview if supported
            var previewPath = char.preview;
            if (typeof getCharacterPreview === 'function') {
                previewPath = getCharacterPreview(char.id);
            }

            card.innerHTML =
                '<div class="character-option-preview">' +
                    '<img src="' + previewPath + '" alt="' + char.name + '" class="character-option-img">' +
                '</div>' +
                '<div class="character-option-name">' + char.name + '</div>';

            container.appendChild(card);
        });
    }

    function selectCharacter(characterId) {
        currentCharacterId = characterId;

        renderCharacterOptions();
        updateCharacterPreview();
        setCurrentCharacter(characterId);

        var characters = [];
        if (typeof getCharacterList === 'function') {
            characters = getCharacterList();
        }
        var char = characters.find(function(c) { return c.id === characterId; });
        if (char) {
            UI.showToast('已选择角色: ' + char.name);
        }
    }

    function updateCharacterPreview() {
        var previewImage = document.getElementById('preview-character-image');
        var mainImage = document.getElementById('character-image');

        var imagePath = null;
        if (typeof getCharacterImage === 'function') {
            imagePath = getCharacterImage(currentCharacterId, 'idle');
        }

        if (previewImage && imagePath) {
            previewImage.src = imagePath;
        }
        if (mainImage && imagePath) {
            mainImage.src = imagePath;
        }
    }

    function initCharacterEditor() {
        var savedCharacterId = localStorage.getItem('egfCurrentCharacter') || 'female_adventurer';
        currentCharacterId = savedCharacterId;

        renderCharacterOptions();
        updateCharacterPreview();

        var savedImage = localStorage.getItem('egfCharacterImage');
        if (savedImage) {
            showCustomImagePreview(savedImage);
        }
    }

    function saveCharacterConfig() {
        localStorage.setItem('egfCurrentCharacter', currentCharacterId);
        setCurrentCharacter(currentCharacterId);
        UI.showToast('角色配置已保存');
    }

    function resetCharacterConfig() {
        currentCharacterId = 'female_adventurer';

        renderCharacterOptions();
        updateCharacterPreview();
        setCurrentCharacter('female_adventurer');

        localStorage.removeItem('egfCharacterImage');
        hideCustomImagePreview();

        UI.showToast('已重置为默认角色');
    }

    function exportCharacterConfigFile() {
        var config = {
            currentCharacterId: currentCharacterId,
            customImage: localStorage.getItem('egfCharacterImage')
        };

        var data = JSON.stringify(config, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'character-config-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);

        UI.showToast('角色配置已导出');
    }

    function importCharacterConfigFile(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var config = JSON.parse(e.target.result);

                if (config.currentCharacterId) {
                    currentCharacterId = config.currentCharacterId;
                    localStorage.setItem('egfCurrentCharacter', config.currentCharacterId);
                }

                if (config.customImage) {
                    localStorage.setItem('egfCharacterImage', config.customImage);
                }

                renderCharacterOptions();
                updateCharacterPreview();
                UI.showToast('角色配置已导入');
            } catch (error) {
                UI.showToast('导入失败: 无效的配置文件');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    var Character = {
        setCharacterAnimation: setCharacterAnimation,
        setCurrentCharacter: setCurrentCharacter,
        handleCharacterImageUpload: handleCharacterImageUpload,
        removeCustomCharacterImage: removeCustomCharacterImage,
        saveCharacterConfig: saveCharacterConfig,
        resetCharacterConfig: resetCharacterConfig,
        exportCharacterConfigFile: exportCharacterConfigFile,
        importCharacterConfigFile: importCharacterConfigFile,
        initCharacterEditor: initCharacterEditor,
        renderCharacterOptions: renderCharacterOptions,
        selectCharacter: selectCharacter,
        updateCharacterPreview: updateCharacterPreview,
        showCustomImagePreview: showCustomImagePreview,
        hideCustomImagePreview: hideCustomImagePreview,
        getCurrentCharacterId: function() { return currentCharacterId; }
    };

    global.App = global.App || {};
    global.App.Character = Character;

    global.setCharacterAnimation = setCharacterAnimation;
    global.setCurrentCharacter = setCurrentCharacter;
    global.handleCharacterImageUpload = handleCharacterImageUpload;
    global.removeCustomCharacterImage = removeCustomCharacterImage;
    global.saveCharacterConfig = saveCharacterConfig;
    global.resetCharacterConfig = resetCharacterConfig;
    global.exportCharacterConfigFile = exportCharacterConfigFile;
    global.importCharacterConfigFile = importCharacterConfigFile;

})(window);
