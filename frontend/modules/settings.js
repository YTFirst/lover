(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;

    function updateModelList() {
        var provider = document.getElementById('model-provider').value;
        var modelSelect = document.getElementById('model-id');

        var models = App.Constants.MODEL_CONFIGS[provider] || [];

        modelSelect.innerHTML = '';
        models.forEach(function(model) {
            var option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });

        var settings = Store.getRef('settings');
        settings.modelProvider = provider;
        settings.modelId = models[0] ? models[0].id : '';
        App.Storage.save();
    }

    function toggleApiKeyVisibility() {
        var input = document.getElementById('api-key');
        var icon = document.getElementById('eye-icon');

        if (input.type === 'password') {
            input.type = 'text';
            icon.innerHTML =
                '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>' +
                '<line x1="1" y1="1" x2="23" y2="23"/>';
        } else {
            input.type = 'password';
            icon.innerHTML =
                '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
                '<circle cx="12" cy="12" r="3"/>';
        }
    }

    async function testConnection() {
        var apiKey = document.getElementById('api-key').value.trim();

        if (!apiKey) {
            UI.showToast('请先输入API Key');
            return;
        }

        if (apiKey.length < 10) {
            UI.showToast('API Key格式不正确');
            return;
        }

        var settings = Store.getRef('settings');
        settings.apiKey = apiKey;
        App.Storage.save();

        if (typeof llmService !== 'undefined') {
            llmService.configure(
                settings.modelProvider,
                settings.modelId,
                apiKey
            );
        }

        UI.showToast('正在测试连接...');

        try {
            if (typeof llmService !== 'undefined') {
                var result = await llmService.testConnection();
                if (result.success) {
                    UI.showToast('连接成功！');
                } else {
                    UI.showToast('连接失败: ' + result.message);
                }
            } else {
                UI.showToast('LLM服务未加载');
            }
        } catch (error) {
            UI.showToast('连接失败: ' + error.message);
        }
    }

    function confirmClearData() {
        if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) return;
        if (!confirm('再次确认：这将删除所有对话历史和记忆！')) return;

        clearAllData();
    }

    function clearAllData() {
        localStorage.removeItem('egfMessages');
        localStorage.removeItem('egfMemories');
        localStorage.removeItem('egfSettings');

        Store.setState('messages', []);
        Store.setState('memories', []);
        Store.setState('settings', {
            apiKey: '',
            modelProvider: 'zhipu',
            modelId: 'charglm-4'
        });

        Store.setState('messagePage', 1);
        Store.setState('hasMoreMessages', false);
        Store.setState('isLoadingMore', false);
        Store.setState('scrollPosition', 0);

        if (typeof renderMessageList === 'function') renderMessageList();
        if (typeof App.Memory !== 'undefined' && App.Memory.renderMemoryList) App.Memory.renderMemoryList();
        document.getElementById('api-key').value = '';
        document.getElementById('model-provider').value = 'zhipu';
        updateModelList();

        if (typeof addWelcomeMessage === 'function') addWelcomeMessage();

        UI.showToast('数据已清除');
    }

    function showPrivacyPolicy() {
        alert('【电子女友 隐私政策】\n\n' +
            '更新日期：2026年4月3日\n' +
            '生效日期：2026年4月3日\n\n' +
            '一、信息收集\n' +
            '电子女友 是一款端侧优先的虚拟女友应用，我们承诺：\n' +
            '• 不收集、不上传任何用户数据\n' +
            '• 所有对话、记忆等数据仅存储在您的设备本地\n' +
            '• 您的API Key仅用于调用大模型服务，不会上传到我们的服务器\n\n' +
            '二、数据存储\n' +
            '• 所有数据使用 LocalStorage 和安全存储机制保存在本地\n' +
            '• 您可以随时在设置页面清除所有数据\n' +
            '• 卸载应用将自动删除所有本地数据\n\n' +
            '三、第三方服务\n' +
            '• 应用需要您自行配置大模型API Key\n' +
            '• API调用直接发送到大模型服务商（如智谱AI、通义千问等）\n' +
            '• 请查阅相应服务商的隐私政策了解数据处理方式\n\n' +
            '四、用户权利\n' +
            '• 您拥有对自己数据的完全控制权\n' +
            '• 可以随时查看、编辑、删除任何数据\n' +
            '• 可以导出或清除所有数据\n\n' +
            '五、未成年人保护\n' +
            '• 本应用适合18岁以上用户使用\n' +
            '• 未成年人请在监护人指导下使用\n\n' +
            '六、联系我们\n' +
            '如有任何问题，请通过应用内的反馈功能联系我们。\n\n' +
            '本隐私政策可能会不时更新，请在使用前仔细阅读。');
    }

    function showUserAgreement() {
        alert('【电子女友 用户协议】\n\n' +
            '更新日期：2026年4月3日\n' +
            '生效日期：2026年4月3日\n\n' +
            '一、服务说明\n' +
            '电子女友 是一款虚拟女友应用，提供AI对话、记忆管理等功能。本应用仅供娱乐陪伴使用，不构成任何医疗、诊断或治疗建议。\n\n' +
            '二、用户责任\n' +
            '• 请勿利用本应用从事违法活动\n' +
            '• 请勿输入危害他人或自己的内容\n' +
            '• 请合理使用，不要过度依赖AI陪伴\n\n' +
            '三、免责声明\n' +
            '• 本应用不提供医疗、心理治疗等专业服务\n' +
            '• 如遇心理危机，请及时寻求专业帮助或拨打心理援助热线\n' +
            '• AI生成的内容仅供参考，不构成专业建议\n\n' +
            '四、危机干预\n' +
            '当检测到危机关键词时，应用会显示心理援助热线信息：\n' +
            '• 全国心理援助热线：400-161-9995\n' +
            '• 北京心理危机研究与干预中心：010-82951332\n' +
            '• 生命热线：400-821-1215\n\n' +
            '五、知识产权\n' +
            '• 本应用的所有内容（包括但不限于文字、图片、音频、视频、软件等）的知识产权归开发者所有\n' +
            '• 未经授权，不得复制、修改、传播本应用的任何内容\n\n' +
            '六、协议修改\n' +
            '我们保留随时修改本协议的权利，修改后的协议将在应用内公布。\n\n' +
            '七、法律适用\n' +
            '本协议受中华人民共和国法律管辖。\n\n' +
            '使用本应用即表示您已阅读并同意本协议的所有条款。');
    }

    function checkFirstLaunch() {
        var hasAgreed = localStorage.getItem('egfUserAgreement');
        if (!hasAgreed) {
            showUserAgreementModal();
        }
    }

    function showUserAgreementModal() {
        var modal = document.getElementById('user-agreement-modal');
        modal.classList.add('show');

        var countdown = 10;
        var countdownText = document.getElementById('countdown-text');
        var checkbox = document.getElementById('agree-checkbox');
        var confirmBtn = document.getElementById('confirm-agreement-btn');

        var timer = setInterval(function() {
            countdown--;
            countdownText.textContent = '请阅读协议 (' + countdown + '秒)';

            if (countdown <= 0) {
                clearInterval(timer);
                countdownText.textContent = '可以勾选同意';
                checkbox.disabled = false;
            }
        }, 1000);

        checkbox.addEventListener('change', function() {
            confirmBtn.disabled = !this.checked;
        });
    }

    function confirmUserAgreement() {
        var checkbox = document.getElementById('agree-checkbox');
        if (!checkbox.checked) {
            UI.showToast('请先勾选同意协议');
            return;
        }

        localStorage.setItem('egfUserAgreement', 'true');
        var modal = document.getElementById('user-agreement-modal');
        modal.classList.remove('show');
        UI.showToast('欢迎使用电子女友！');
    }

    var Settings = {
        updateModelList: updateModelList,
        toggleApiKeyVisibility: toggleApiKeyVisibility,
        testConnection: testConnection,
        confirmClearData: confirmClearData,
        clearAllData: clearAllData,
        showPrivacyPolicy: showPrivacyPolicy,
        showUserAgreement: showUserAgreement,
        checkFirstLaunch: checkFirstLaunch,
        showUserAgreementModal: showUserAgreementModal,
        confirmUserAgreement: confirmUserAgreement
    };

    global.App = global.App || {};
    global.App.Settings = Settings;

    global.updateModelList = updateModelList;
    global.toggleApiKeyVisibility = toggleApiKeyVisibility;
    global.testConnection = testConnection;
    global.confirmClearData = confirmClearData;
    global.clearAllData = clearAllData;
    global.showPrivacyPolicy = showPrivacyPolicy;
    global.showUserAgreement = showUserAgreement;
    global.checkFirstLaunch = checkFirstLaunch;
    global.showUserAgreementModal = showUserAgreementModal;
    global.confirmUserAgreement = confirmUserAgreement;

})(window);
