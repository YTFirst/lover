(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;
    var Constants = App.Constants;

    function _loadThemeConfig() {
        var saved = localStorage.getItem('egfThemeConfig');
        if (saved) {
            return JSON.parse(saved);
        }
        return JSON.parse(JSON.stringify(Constants.DEFAULT_THEME_CONFIG));
    }

    function _validateBackupData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, message: '数据格式错误' };
        }

        if (!data.version || !data.timestamp || !data.data) {
            return { valid: false, message: '缺少必要的备份信息' };
        }

        if (data.app !== '电子女友') {
            return { valid: false, message: '不是电子女友的备份文件' };
        }

        if (!data.data.sessions || !Array.isArray(data.data.sessions)) {
            return { valid: false, message: '会话数据格式错误' };
        }

        if (!data.data.agents || !Array.isArray(data.data.agents)) {
            return { valid: false, message: '智能体数据格式错误' };
        }

        if (!data.data.memories || !Array.isArray(data.data.memories)) {
            return { valid: false, message: '记忆数据格式错误' };
        }

        if (!data.data.settings || typeof data.data.settings !== 'object') {
            return { valid: false, message: '设置数据格式错误' };
        }

        return { valid: true };
    }

    function _restoreAllData(backupData) {
        var data = backupData.data;

        if (data.sessions && Array.isArray(data.sessions)) {
            Store.setState('sessions', data.sessions);
        }

        if (data.currentSessionId) {
            Store.setState('currentSessionId', data.currentSessionId);
        }

        if (data.agents && Array.isArray(data.agents)) {
            Store.setState('agents', data.agents);
        }

        if (data.currentAgentId) {
            Store.setState('currentAgentId', data.currentAgentId);
        }

        if (data.memories && Array.isArray(data.memories)) {
            Store.setState('memories', data.memories);
        }

        if (data.settings && typeof data.settings === 'object') {
            Store.setState('settings', data.settings);
        }

        if (data.themeConfig) {
            localStorage.setItem('egfThemeConfig', JSON.stringify(data.themeConfig));
        }

        if (data.characterConfig) {
            if (data.characterConfig.currentCharacterId) {
                localStorage.setItem('egfCurrentCharacter', data.characterConfig.currentCharacterId);
            }
            if (data.characterConfig.customImage) {
                localStorage.setItem('egfCharacterImage', data.characterConfig.customImage);
            }
        }

        console.log('数据恢复完成');
    }

    function _confirmRestoreData(backupData, filename) {
        var backupTime = new Date(backupData.timestamp).toLocaleString('zh-CN');
        var sessionCount = backupData.data.sessions.length;
        var agentCount = backupData.data.agents.length;
        var memoryCount = backupData.data.memories.length;

        var confirmMessage = '确认恢复数据？\n\n' +
            '备份文件: ' + filename + '\n' +
            '备份时间: ' + backupTime + '\n' +
            '备份版本: ' + backupData.version + '\n\n' +
            '包含数据:\n' +
            '• ' + sessionCount + ' 个会话\n' +
            '• ' + agentCount + ' 个智能体\n' +
            '• ' + memoryCount + ' 条记忆\n' +
            '• 主题配置\n' +
            '• 角色配置\n\n' +
            '⚠️ 警告：此操作将覆盖当前所有数据！\n\n' +
            '是否继续？';

        if (!confirm(confirmMessage)) {
            UI.showToast('已取消恢复操作');
            return;
        }

        try {
            _restoreAllData(backupData);
            UI.showToast('数据恢复成功！页面将刷新');

            setTimeout(function() {
                location.reload();
            }, 1500);

        } catch (error) {
            console.error('恢复数据失败:', error);
            UI.showToast('恢复数据失败: ' + error.message);
        }
    }

    function _downloadFile(blob, fileName) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function _showExportSuccess(fileName) {
        var downloadPath = '下载文件夹/' + fileName;
        document.getElementById('export-file-path').textContent = downloadPath;
        document.getElementById('export-success-modal').classList.add('show');
    }

    function _exportToJSON(sessionId) {
        var exportData;
        var fileName;
        var timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        var sessions = Store.getRef('sessions');
        var agents = Store.getRef('agents');

        if (sessionId === 'all') {
            exportData = {
                exportVersion: '1.0',
                exportTime: new Date().toISOString(),
                appVersion: Constants.APP_VERSION,
                sessions: sessions.map(function(session) {
                    var agent = agents.find(function(a) { return a.id === session.agentId; }) || { name: '小雅' };
                    return {
                        id: session.id,
                        name: session.name,
                        agentName: agent.name,
                        createdAt: session.createdAt,
                        updatedAt: session.updatedAt,
                        messageCount: session.messages ? session.messages.length : 0,
                        messages: session.messages || []
                    };
                })
            };
            fileName = 'listen-claw-all-sessions-' + timestamp + '.json';
        } else {
            var session = sessions.find(function(s) { return s.id === sessionId; });
            if (!session) {
                UI.showToast('会话不存在');
                return;
            }

            var agent = agents.find(function(a) { return a.id === session.agentId; }) || { name: '小雅' };
            exportData = {
                exportVersion: '1.0',
                exportTime: new Date().toISOString(),
                appVersion: Constants.APP_VERSION,
                session: {
                    id: session.id,
                    name: session.name,
                    agentName: agent.name,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    messageCount: session.messages ? session.messages.length : 0,
                    messages: session.messages || []
                }
            };
            fileName = 'listen-claw-' + session.name + '-' + timestamp + '.json';
        }

        var jsonStr = JSON.stringify(exportData, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        _downloadFile(blob, fileName);

        _showExportSuccess(fileName);
    }

    function _exportToTXT(sessionId) {
        var content = '';
        var timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        var fileName;
        var sessions = Store.getRef('sessions');
        var agents = Store.getRef('agents');

        var formatMessage = function(message, agentName) {
            var time = new Date(message.timestamp).toLocaleString('zh-CN');
            var sender = message.type === 'user' ? '我' : agentName;
            return '[' + time + '] ' + sender + ': ' + message.content + '\n';
        };

        if (sessionId === 'all') {
            content += '========================================\n';
            content += '电子女友 对话导出\n';
            content += '导出时间: ' + new Date().toLocaleString('zh-CN') + '\n';
            content += '应用版本: ' + Constants.APP_VERSION + '\n';
            content += '========================================\n\n';

            sessions.forEach(function(session, index) {
                var agent = agents.find(function(a) { return a.id === session.agentId; }) || { name: '小雅' };
                content += '\n----------------------------------------\n';
                content += '会话 ' + (index + 1) + ': ' + session.name + '\n';
                content += '智能体: ' + agent.name + '\n';
                content += '创建时间: ' + new Date(session.createdAt).toLocaleString('zh-CN') + '\n';
                content += '消息数: ' + (session.messages ? session.messages.length : 0) + '\n';
                content += '----------------------------------------\n\n';

                if (session.messages && session.messages.length > 0) {
                    session.messages.forEach(function(message) {
                        content += formatMessage(message, agent.name);
                    });
                } else {
                    content += '(暂无消息)\n';
                }
            });

            fileName = 'listen-claw-all-sessions-' + timestamp + '.txt';
        } else {
            var session = sessions.find(function(s) { return s.id === sessionId; });
            if (!session) {
                UI.showToast('会话不存在');
                return;
            }

            var agent = agents.find(function(a) { return a.id === session.agentId; }) || { name: '小雅' };

            content += '========================================\n';
            content += '会话: ' + session.name + '\n';
            content += '智能体: ' + agent.name + '\n';
            content += '导出时间: ' + new Date().toLocaleString('zh-CN') + '\n';
            content += '创建时间: ' + new Date(session.createdAt).toLocaleString('zh-CN') + '\n';
            content += '消息数: ' + (session.messages ? session.messages.length : 0) + '\n';
            content += '========================================\n\n';

            if (session.messages && session.messages.length > 0) {
                session.messages.forEach(function(message) {
                    content += formatMessage(message, agent.name);
                });
            } else {
                content += '(暂无消息)\n';
            }

            fileName = 'listen-claw-' + session.name + '-' + timestamp + '.txt';
        }

        var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        _downloadFile(blob, fileName);

        _showExportSuccess(fileName);
    }

    function exportAllData() {
        try {
            var backupData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                app: '电子女友',
                data: {
                    sessions: Store.getRef('sessions'),
                    currentSessionId: Store.getRef('currentSessionId'),
                    agents: Store.getRef('agents'),
                    currentAgentId: Store.getRef('currentAgentId'),
                    memories: Store.getRef('memories'),
                    settings: Store.getRef('settings'),
                    themeConfig: _loadThemeConfig(),
                    characterConfig: {
                        currentCharacterId: localStorage.getItem('egfCurrentCharacter'),
                        customImage: localStorage.getItem('egfCharacterImage')
                    }
                }
            };

            var jsonString = JSON.stringify(backupData, null, 2);

            var blob = new Blob([jsonString], { type: 'application/json' });

            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');

            var now = new Date();
            var dateStr = now.getFullYear() +
                           String(now.getMonth() + 1).padStart(2, '0') +
                           String(now.getDate()).padStart(2, '0') + '_' +
                           String(now.getHours()).padStart(2, '0') +
                           String(now.getMinutes()).padStart(2, '0') +
                           String(now.getSeconds()).padStart(2, '0');
            var filename = 'electronic-girlfriend-backup-' + dateStr + '.json';

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            UI.showToast('数据备份成功！文件已下载');

        } catch (error) {
            console.error('备份数据失败:', error);
            UI.showToast('备份失败: ' + error.message);
        }
    }

    function importAllData(event) {
        var file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            UI.showToast('请选择JSON格式的备份文件');
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            UI.showToast('文件大小不能超过10MB');
            event.target.value = '';
            return;
        }

        var reader = new FileReader();

        reader.onload = function(e) {
            try {
                var jsonString = e.target.result;
                var backupData = JSON.parse(jsonString);

                var validation = _validateBackupData(backupData);

                if (!validation.valid) {
                    UI.showToast('备份文件格式无效: ' + validation.message);
                    event.target.value = '';
                    return;
                }

                _confirmRestoreData(backupData, file.name);

            } catch (error) {
                console.error('解析备份文件失败:', error);
                UI.showToast('解析备份文件失败: ' + error.message);
            }

            event.target.value = '';
        };

        reader.onerror = function() {
            UI.showToast('读取文件失败');
            event.target.value = '';
        };

        reader.readAsText(file);
    }

    function handleExport() {
        var format = document.querySelector('input[name="export-format"]:checked').value;
        var sessionId = document.getElementById('export-session-select').value;

        if (format === 'json') {
            _exportToJSON(sessionId);
        } else if (format === 'txt') {
            _exportToTXT(sessionId);
        }

        closeExportDialog();
    }

    function closeExportDialog() {
        document.getElementById('export-dialog').classList.remove('show');
    }

    function closeExportSuccessModal() {
        document.getElementById('export-success-modal').classList.remove('show');
    }

    var Export = {
        exportAllData: exportAllData,
        importAllData: importAllData,
        handleExport: handleExport,
        closeExportDialog: closeExportDialog,
        closeExportSuccessModal: closeExportSuccessModal
    };

    global.App = global.App || {};
    global.App.Export = Export;

    global.exportAllData = exportAllData;
    global.importAllData = importAllData;
    global.handleExport = handleExport;
    global.closeExportDialog = closeExportDialog;
    global.closeExportSuccessModal = closeExportSuccessModal;

})(window);
