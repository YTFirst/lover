(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;

    function renderMemoryList(filter, searchTerm) {
        filter = filter || 'all';
        searchTerm = searchTerm || '';
        var memoryList = document.getElementById('memory-list');
        memoryList.innerHTML = '';

        var memories = Store.getRef('memories');
        var filteredMemories = memories.filter(function(memory) {
            if (filter !== 'all' && memory.type !== filter) {
                return false;
            }
            if (searchTerm && !memory.content.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            return memory.isActive;
        });

        filteredMemories.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

        if (filteredMemories.length === 0) {
            memoryList.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--gray-medium);">暂无记忆</div>';
            return;
        }

        filteredMemories.forEach(function(memory) {
            var memoryElement = createMemoryElement(memory);
            memoryList.appendChild(memoryElement);
        });
    }

    function createMemoryElement(memory) {
        var memoryDiv = document.createElement('div');
        memoryDiv.className = 'memory-card';
        memoryDiv.dataset.id = memory.id;

        var typeIcons = {
            profile: '[资料]',
            event: '[事件]',
            custom: '[自定义]'
        };

        var typeNames = {
            profile: '个人资料',
            event: '事件',
            custom: '自定义'
        };

        memoryDiv.innerHTML =
            '<div class="memory-header">' +
                '<div class="memory-type">' +
                    '<span class="memory-type-icon">' + typeIcons[memory.type] + '</span>' +
                    '<span>' + typeNames[memory.type] + '</span>' +
                '</div>' +
                '<div class="memory-actions">' +
                    '<button class="memory-action-btn edit" onclick="editMemory(' + memory.id + ')" title="编辑">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
                            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
                        '</svg>' +
                    '</button>' +
                    '<button class="memory-action-btn delete" onclick="deleteMemory(' + memory.id + ')" title="删除">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                            '<polyline points="3 6 5 6 21 6"/>' +
                            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
                        '</svg>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="memory-content">' + UI.escapeHtml(memory.content) + '</div>' +
            '<div class="memory-meta">创建于: ' + UI.formatDate(memory.createdAt) + '</div>';

        return memoryDiv;
    }

    function showAddMemoryDialog() {
        Store.setState('editingMemoryId', null);
        document.getElementById('memory-dialog-title').textContent = '添加记忆';
        document.getElementById('memory-type').value = 'custom';
        document.getElementById('memory-content').value = '';
        document.getElementById('char-count').textContent = '0';
        document.getElementById('memory-dialog').classList.add('show');
    }

    function editMemory(id) {
        var memories = Store.getRef('memories');
        var memory = memories.find(function(m) { return m.id === id; });
        if (!memory) return;

        Store.setState('editingMemoryId', id);
        document.getElementById('memory-dialog-title').textContent = '编辑记忆';
        document.getElementById('memory-type').value = memory.type;
        document.getElementById('memory-content').value = memory.content;
        document.getElementById('char-count').textContent = memory.content.length;
        document.getElementById('memory-dialog').classList.add('show');
    }

    function saveMemory() {
        var type = document.getElementById('memory-type').value;
        var content = document.getElementById('memory-content').value.trim();

        if (!content) {
            UI.showToast('记忆内容不能为空');
            return;
        }

        if (content.length > 500) {
            UI.showToast('记忆内容不能超过500字符');
            return;
        }

        var editingMemoryId = Store.getState('editingMemoryId');
        if (editingMemoryId) {
            var memories = Store.getRef('memories');
            var memory = memories.find(function(m) { return m.id === editingMemoryId; });
            if (memory) {
                memory.type = type;
                memory.content = content;
                memory.updatedAt = new Date().toISOString();
            }
        } else {
            var newMemory = {
                id: Date.now(),
                type: type,
                content: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            };
            Store.getRef('memories').push(newMemory);
        }

        App.Storage.save();
        renderMemoryList();
        closeMemoryDialog();
        UI.showToast('保存成功');
    }

    function deleteMemory(id) {
        if (!confirm('确定要删除这条记忆吗？')) return;

        var memories = Store.getRef('memories');
        var memory = memories.find(function(m) { return m.id === id; });
        if (memory) {
            memory.isActive = false;
            memory.updatedAt = new Date().toISOString();
        }

        App.Storage.save();
        renderMemoryList();
        UI.showToast('删除成功');
    }

    function closeMemoryDialog() {
        document.getElementById('memory-dialog').classList.remove('show');
        Store.setState('editingMemoryId', null);
    }

    function filterMemories() {
        var searchTerm = document.getElementById('memory-search').value;
        var activeFilter = document.querySelector('.filter-tab.active');
        var filterType = activeFilter ? activeFilter.dataset.type : 'all';

        renderMemoryList(filterType, searchTerm);
    }

    function filterByType(type) {
        document.querySelectorAll('.filter-tab').forEach(function(tab) {
            tab.classList.remove('active');
        });
        document.querySelector('.filter-tab[data-type="' + type + '"]').classList.add('active');

        var searchTerm = document.getElementById('memory-search').value;
        renderMemoryList(type, searchTerm);
    }

    var Memory = {
        renderMemoryList: renderMemoryList,
        createMemoryElement: createMemoryElement,
        showAddMemoryDialog: showAddMemoryDialog,
        editMemory: editMemory,
        saveMemory: saveMemory,
        deleteMemory: deleteMemory,
        closeMemoryDialog: closeMemoryDialog,
        filterMemories: filterMemories,
        filterByType: filterByType
    };

    global.App = global.App || {};
    global.App.Memory = Memory;

    global.renderMemoryList = renderMemoryList;
    global.createMemoryElement = createMemoryElement;
    global.showAddMemoryDialog = showAddMemoryDialog;
    global.editMemory = editMemory;
    global.saveMemory = saveMemory;
    global.deleteMemory = deleteMemory;
    global.closeMemoryDialog = closeMemoryDialog;
    global.filterMemories = filterMemories;
    global.filterByType = filterByType;

})(window);
