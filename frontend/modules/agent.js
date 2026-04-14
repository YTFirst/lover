(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;

    var currentAgentMemories = [];
    var currentAgentNamingRelations = {};
    var currentAgentAvatar = { type: 'preset', characterId: 'female_adventurer', color: '#FF6B9D' };

    async function loadAgentsFromAPI() {
        try {
            const response = await fetch('http://localhost:5050/api/agents');
            const data = await response.json();

            if (data.success && data.agents) {
                Store.setState('agents', data.agents);
                console.log('[Agent] 从API加载智能体成功', data.agents.map(a => a.name));

                if (!Store.getState('currentAgentId') && data.agents.length > 0) {
                    const defaultAgent = data.agents.find(a => a.metadata && a.metadata.isDefault);
                    Store.setState('currentAgentId', defaultAgent ? defaultAgent.id : data.agents[0].id);
                    console.log('[Agent] 设置默认智能体', Store.getState('currentAgentId'));
                }

                App.Storage.save();
                renderAgentList();
            } else {
                console.error('[Agent] API返回数据格式错误:', data);
                throw new Error('API返回数据格式错误');
            }
        } catch (error) {
            console.error('[Agent] 加载智能体失败', error);

            const cachedAgents = localStorage.getItem('egfAgents');
            if (cachedAgents) {
                try {
                    const parsedAgents = JSON.parse(cachedAgents);
                    Store.setState('agents', parsedAgents);
                    console.log('[Agent] 从缓存加载智能体:', parsedAgents.map(a => a.name));

                    if (!Store.getState('currentAgentId') && parsedAgents.length > 0) {
                        const defaultAgent = parsedAgents.find(a => a.metadata && a.metadata.isDefault);
                        Store.setState('currentAgentId', defaultAgent ? defaultAgent.id : parsedAgents[0].id);
                    }

                    renderAgentList();
                    UI.showToast('已从缓存加载智能体');
                } catch (parseError) {
                    console.error('[Agent] 解析缓存数据失败:', parseError);
                    UI.showToast('加载智能体失败，请刷新页面重试');
                }
            } else {
                UI.showToast('加载智能体失败，请刷新页面重试');
            }
        }
    }

    async function initDefaultAgents() {
        var agents = Store.getRef('agents');
        if (!agents || agents.length === 0) {
            await loadAgentsFromAPI();
        } else {
            renderAgentList();
            updateChatTitle();
        }
    }

    function renderAgentList() {
        const container = document.getElementById('agents-list');
        if (!container) return;

        container.innerHTML = '';

        const agents = Store.getRef('agents');
        const currentAgentId = Store.getState('currentAgentId');

        agents.forEach(agent => {
            const isLocked = agent.metadata && agent.metadata.isLocked;
            const isDefault = agent.metadata && agent.metadata.isDefault;

            const card = document.createElement('div');
            card.className = `agent-card ${agent.id === currentAgentId ? 'active' : ''}`;
            card.innerHTML = `
                <div class="agent-card-header">
                    <div class="agent-avatar">${agent.name.charAt(0)}</div>
                    <div class="agent-info">
                        <h3 class="agent-name">
                            ${agent.name}
                            ${isDefault ? '<span class="default-badge">[默认]</span>' : ''}
                            ${isLocked ? '<span class="lock-badge">[锁定]</span>' : ''}
                        </h3>
                        <p class="agent-personality">${agent.personality}</p>
                    </div>
                </div>
                <div class="agent-card-actions">
                    ${agent.id === currentAgentId
        ? '<span class="current-badge">当前使用</span>'
        : `<button class="button button-small button-primary" onclick="selectAgent('${agent.id}')">选择</button>`
    }
                    <button class="button button-small button-secondary" onclick="shareAgent('${agent.id}')">分享</button>
                    ${!isLocked ? `
                        <button class="button button-small button-secondary" onclick="editAgent('${agent.id}')">编辑</button>
                        <button class="button button-small button-danger" onclick="deleteAgent('${agent.id}')">删除</button>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    }

    async function selectAgent(agentId, forceSwitch = false) {
        var agents = Store.getRef('agents');
        
        if (!agents || agents.length === 0) {
            await loadAgentsFromAPI();
            agents = Store.getRef('agents');
        }
        
        var agent = agents.find(a => a.id === agentId);
        if (!agent) {
            UI.showToast('智能体不存在');
            return;
        }

        const sessions = Store.getRef('sessions');
        const currentSessionId = Store.getState('currentSessionId');
        const currentSession = sessions.find(s => s.id === currentSessionId);
        const hasMessages = currentSession && currentSession.messages && currentSession.messages.length > 0;

        if (!forceSwitch && hasMessages && currentSession.agentId !== agentId) {
            showAgentSwitchDialog(agentId, agent.name);
            return;
        }

        Store.setState('currentAgentId', agentId);

        if (currentSession) {
            if (!hasMessages || forceSwitch) {
                currentSession.agentId = agentId;
            }
        }

        App.Storage.save();
        renderAgentList();
        updateChatTitle();
        UI.showToast(`已切换到 ${agent.name}`);
    }

    function showAgentSwitchDialog(agentId, agentName) {
        const result = confirm(
            '当前会话已有对话记录。\n\n' +
            `切换到"${agentName}" 将创建新会话。\n\n` +
            '点击"确定"创建新会话，点击"取消"保持当前会话。'
        );

        if (result) {
            if (typeof window.createNewSession === 'function') {
                window.createNewSession(null, agentId);
            }
            UI.showToast(`已创建新会话并切换到 ${agentName}`);
        }
    }

    function showAddAgentDialog() {
        Store.setState('editingAgentId', null);
        document.getElementById('agent-dialog-title').textContent = '添加智能体';
        document.getElementById('agent-name').value = '';
        document.getElementById('agent-personality').value = '';
        document.getElementById('agent-habits').value = '';
        document.getElementById('agent-style').value = 'warm';
        document.getElementById('agent-system-prompt').value = '';

        currentAgentMemories = [];
        currentAgentNamingRelations = {};
        currentAgentAvatar = { type: 'preset', characterId: 'female_adventurer', color: '#FF6B9D' };

        document.querySelectorAll('.tabs .tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('.tabs .tab:first-child')?.classList.add('active');
        document.getElementById('agent-tab-basic')?.classList.add('active');

        updateCharCounts();
        renderAgentMemoryList();
        renderNamingRelations();
        updateAvatarPreview();

        document.getElementById('export-agent-btn').style.display = 'none';

        document.getElementById('agent-dialog').classList.add('show');
    }

    function editAgent(agentId) {
        const agents = Store.getRef('agents');
        const agent = agents.find(a => a.id === agentId);
        if (!agent || (agent.metadata && agent.metadata.isLocked)) return;

        Store.setState('editingAgentId', agentId);
        document.getElementById('agent-dialog-title').textContent = '编辑智能体';
        document.getElementById('agent-name').value = agent.name;
        document.getElementById('agent-personality').value = agent.personality;
        document.getElementById('agent-habits').value = agent.habits || '';
        document.getElementById('agent-style').value = agent.style || 'warm';
        document.getElementById('agent-system-prompt').value = agent.systemPrompt || '';

        currentAgentMemories = agent.memories || [];
        currentAgentNamingRelations = agent.namingRelations || {};
        currentAgentAvatar = agent.avatar || { type: 'preset', characterId: 'female_adventurer', color: '#FF6B9D' };

        document.querySelectorAll('.tabs .tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('.tabs .tab:first-child')?.classList.add('active');
        document.getElementById('agent-tab-basic')?.classList.add('active');

        updateCharCounts();
        renderAgentMemoryList();
        renderNamingRelations();
        updateAvatarPreview();

        document.getElementById('export-agent-btn').style.display = 'inline-block';

        document.getElementById('agent-dialog').classList.add('show');
    }

    async function saveAgent() {
        const name = document.getElementById('agent-name').value.trim();
        const personality = document.getElementById('agent-personality').value.trim();
        const habits = document.getElementById('agent-habits').value.trim();
        const style = document.getElementById('agent-style').value;
        const systemPrompt = document.getElementById('agent-system-prompt').value.trim();

        if (!name) {
            UI.showToast('请输入智能体名称');
            return;
        }

        if (name.length < 1 || name.length > 20) {
            UI.showToast('名称长度应为1-20个字符');
            return;
        }

        if (!personality) {
            UI.showToast('请输入人设描述');
            return;
        }

        if (personality.length < 10) {
            UI.showToast('人设描述至少需要10个字符');
            return;
        }

        const agentData = {
            name,
            personality,
            habits,
            style,
            systemPrompt: systemPrompt || generateSystemPrompt(name, personality, habits, style),
            memories: currentAgentMemories.filter(m => m.content.trim()),
            namingRelations: currentAgentNamingRelations,
            avatar: currentAgentAvatar
        };

        try {
            var editingAgentId = Store.getState('editingAgentId');
            if (editingAgentId) {
                const response = await fetch(`http://localhost:5050/api/agents/${editingAgentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(agentData)
                });

                const data = await response.json();
                if (data.success) {
                    UI.showToast('智能体已更新');
                    await loadAgentsFromAPI();
                } else {
                    UI.showToast('更新失败: ' + data.error);
                }
            } else {
                const response = await fetch('http://localhost:5050/api/agents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(agentData)
                });

                const data = await response.json();
                if (data.success) {
                    UI.showToast('智能体已添加');
                    await loadAgentsFromAPI();
                } else {
                    UI.showToast('添加失败: ' + data.error);
                }
            }

            closeAgentDialog();
        } catch (error) {
            console.error('保存智能体失败', error);
            UI.showToast('保存失败，请重试');
        }
    }

    async function deleteAgent(agentId) {
        const agents = Store.getRef('agents');
        const agent = agents.find(a => a.id === agentId);
        if (!agent || (agent.metadata && agent.metadata.isLocked)) return;

        if (!confirm(`确定要删除智能体"${agent.name}"吗？`)) return;

        try {
            const response = await fetch(`http://localhost:5050/api/agents/${agentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                if (Store.getState('currentAgentId') === agentId) {
                    var allAgents = Store.getRef('agents');
                    const defaultAgent = allAgents.find(a => a.metadata && a.metadata.isDefault);
                    Store.setState('currentAgentId', defaultAgent ? defaultAgent.id : 'xiaoya');
                }

                await loadAgentsFromAPI();
                UI.showToast('智能体已删除');
            } else {
                UI.showToast('删除失败: ' + data.error);
            }
        } catch (error) {
            console.error('删除智能体失败', error);
            UI.showToast('删除失败，请重试');
        }
    }

    function closeAgentDialog() {
        document.getElementById('agent-dialog').classList.remove('show');
        Store.setState('editingAgentId', null);
    }

    function getCurrentAgentSystemPrompt() {
        const agents = Store.getRef('agents');
        const currentAgentId = Store.getState('currentAgentId');
        const agent = agents.find(a => a.id === currentAgentId);
        if (!agent) return '';

        if (agent.systemPrompt) {
            return agent.systemPrompt;
        }

        return generateSystemPrompt(agent.name, agent.personality, agent.habits, agent.style);
    }

    function generateSystemPrompt(name, personality, habits, style) {
        const styleGuides = {
            warm: '用温柔、体贴、甜蜜的语气回复用户，让用户感受到被爱和被关心。',
            professional: '用专业、理性、客观的语气回复用户，提供准确的信息和建议。',
            casual: '用轻松、随意、幽默的语气回复用户，像朋友一样聊天。',
            literary: '用诗意、浪漫、文艺的语气回复用户，营造美好的氛围。'
        };

        const habitsText = habits ? `\n\n你的习惯用语：\n${habits}` : '';
        const styleGuide = styleGuides[style] || styleGuides.warm;

        return `你是${personality}。你的名字叫"${name}"。${habitsText}

【${styleGuide}】

你必须遵守：
1. 根据你的人设和性格特点来回应用户。
2. ${styleGuide}
3. 先反映情绪，再回应内容。
4. 使用开放式问题引导表达。
5. 如果用户表达危机关键词（如"想死"），请回复：[危机] 然后提供热线。
6. 在回复末尾可以附带 [action:happy] 等动作标签（支持：happy, sad, think, hug, wave, surprised, confused）。`;
    }

    async function showAgentSelector() {
        console.log('[DEBUG] showAgentSelector() called');
        const container = document.getElementById('agent-selector-list');
        if (!container) {
            console.error('[DEBUG] agent-selector-list element NOT found!');
            return;
        }
        console.log('[DEBUG] agent-selector-list element found');

        container.innerHTML = '';

        var agents = Store.getRef('agents');
        console.log('[DEBUG] showAgentSelector - agents:', agents ? agents.length : 'null/undefined');
        
        if (!agents || agents.length === 0) {
            console.log('[DEBUG] showAgentSelector - loading agents from API...');
            await loadAgentsFromAPI();
            agents = Store.getRef('agents');
            console.log('[DEBUG] showAgentSelector - after API load, agents:', agents ? agents.length : 'null/undefined');
        }
        
        if (!agents || agents.length === 0) {
            console.warn('[DEBUG] showAgentSelector - no agents available!');
            UI.showToast('没有可用的智能体');
            return;
        }

        
        const currentAgentId = Store.getState('currentAgentId');
        console.log('[DEBUG] showAgentSelector - currentAgentId:', currentAgentId);

        
        agents.forEach(agent => {
            const item = document.createElement('div');
            item.className = `agent-selector-item ${agent.id === currentAgentId ? 'active' : ''}`;
            item.onclick = () => {
                selectAgent(agent.id);
                closeAgentSelector();
            };
            item.innerHTML = `
                <div class="agent-selector-avatar">${agent.name.charAt(0)}</div>
                <div class="agent-selector-info">
                    <h4 class="agent-selector-name">
                        ${agent.name}
                        ${agent.metadata && agent.metadata.isLocked ? '<span class="lock-badge-small">[锁定]</span>' : ''}
                    </h4>
                    <p class="agent-selector-personality">${agent.personality}</p>
                </div>
                ${agent.id === currentAgentId ? '<span class="check-icon">[当前]</span>' : ''}
            `;
            container.appendChild(item);
        });
        console.log('[DEBUG] showAgentSelector - rendered', agents.length, 'agent items');

        const modalTitle = document.querySelector('#agent-selector-modal .modal-header h2');
        if (modalTitle) {
            modalTitle.textContent = '选择智能体';
        }

        const modal = document.getElementById('agent-selector-modal');
        console.log('[DEBUG] showAgentSelector - modal element:', modal);
        if (modal) {
            modal.classList.add('show');
            console.log('[DEBUG] showAgentSelector - modal.classList:', modal.classList);
            console.log('[DEBUG] showAgentSelector - modal computed display:', window.getComputedStyle(modal).display);
            
            var rect = modal.getBoundingClientRect();
            console.log('[DEBUG] showAgentSelector - modal rect:', JSON.stringify({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom,
                right: rect.right
            }));
            
            console.log('[DEBUG] showAgentSelector - modal computed z-index:', window.getComputedStyle(modal).zIndex);
            console.log('[DEBUG] showAgentSelector - modal computed visibility:', window.getComputedStyle(modal).visibility);
            console.log('[DEBUG] showAgentSelector - modal computed opacity:', window.getComputedStyle(modal).opacity);
            console.log('[DEBUG] showAgentSelector - modal computed position:', window.getComputedStyle(modal).position);
        } else {
            console.error('[DEBUG] showAgentSelector - agent-selector-modal NOT FOUND!');
        }
    }

    function closeAgentSelector() {
        document.getElementById('agent-selector-modal').classList.remove('show');
    }

    function updateChatTitle() {
        const agents = Store.getRef('agents');
        const currentAgentId = Store.getState('currentAgentId');
        const agent = agents.find(a => a.id === currentAgentId);
        const titleElement = document.getElementById('chat-agent-name');
        if (agent && titleElement) {
            titleElement.textContent = agent.name + '的陪伴';
        }
    }

    function switchAgentTab(tabName) {
        document.querySelectorAll('.tabs .tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        var clickedTab = document.querySelector('.tabs .tab[onclick*="' + tabName + '"]');
        if (clickedTab) clickedTab.classList.add('active');
        document.getElementById(`agent-tab-${tabName}`).classList.add('active');

        if (tabName === 'avatar') {
            renderPresetCharacters();
            updateAvatarPreview();
        }
        if (tabName === 'naming') {
            renderNamingRelations();
        }
    }

    function applyTemplate(templateId) {
        const templates = {
            girlfriend: {
                name: '小雅',
                personality: '温柔体贴、善解人意、充满爱意的虚拟女友，总是关心你的生活和情绪',
                habits: '亲爱的~\n宝贝\n当然啦',
                style: 'warm',
                systemPrompt: ''
            },
            assistant: {
                name: '小助',
                personality: '专业理性、高效可靠的工作助手，擅长分析和解决问题',
                habits: '好的\n明白了\n我来帮你处理',
                style: 'professional',
                systemPrompt: ''
            },
            friend: {
                name: '小游',
                personality: '轻松随意、幽默风趣的游戏伙伴，喜欢开玩笑和分享快乐',
                habits: '哈哈\n666\n太棒了',
                style: 'casual',
                systemPrompt: ''
            },
            listener: {
                name: '小听',
                personality: '耐心倾听、温暖陪伴的心理伙伴，善于理解和共情',
                habits: '我在听\n嗯嗯\n我理解你的感受',
                style: 'warm',
                systemPrompt: ''
            }
        };

        const template = templates[templateId];
        if (template) {
            document.getElementById('agent-name').value = template.name;
            document.getElementById('agent-personality').value = template.personality;
            document.getElementById('agent-habits').value = template.habits;
            document.getElementById('agent-style').value = template.style;
            document.getElementById('agent-system-prompt').value = template.systemPrompt;
            updateCharCounts();
            UI.showToast(`已应用"${template.name}"模板`);
        }
    }

    function updateCharCounts() {
        const fields = [
            { id: 'agent-name', countId: 'agent-name-count' },
            { id: 'agent-personality', countId: 'agent-personality-count' },
            { id: 'agent-habits', countId: 'agent-habits-count' },
            { id: 'agent-system-prompt', countId: 'agent-system-prompt-count' }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const count = document.getElementById(field.countId);
            if (input && count) {
                count.textContent = input.value.length;
            }
        });
    }

    function addMemory() {
        const memory = {
            id: Date.now(),
            content: '',
            type: 'custom',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        currentAgentMemories.push(memory);
        renderAgentMemoryList();
    }

    function updateMemory(id, field, value) {
        const memory = currentAgentMemories.find(m => m.id === id);
        if (memory) {
            memory[field] = value;
            if (field === 'content') {
                memory.updatedAt = new Date().toISOString();
            }
        }
    }

    function deleteMemory(id) {
        currentAgentMemories = currentAgentMemories.filter(m => m.id !== id);
        renderAgentMemoryList();
    }

    function toggleMemoryActive(id) {
        const memory = currentAgentMemories.find(m => m.id === id);
        if (memory) {
            memory.isActive = !memory.isActive;
            renderAgentMemoryList();
        }
    }

    function renderAgentMemoryList() {
        const container = document.getElementById('agent-memory-list');
        if (!container) return;

        if (currentAgentMemories.length === 0) {
            container.innerHTML = '<p class="hint-text" style="padding: 20px; text-align: center;">暂无记忆，点击上方按钮添加</p>';
        } else {
            container.innerHTML = currentAgentMemories.map(memory => `
                <div class="memory-item">
                    <div class="memory-item-content">
                        <input type="text" class="form-input memory-item-text"
                               value="${memory.content}"
                               placeholder="输入记忆内容..."
                               onchange="updateMemory(${memory.id}, 'content', this.value)">
                        <div class="memory-item-meta">
                            <select class="form-select" style="width: auto; font-size: 12px;" onchange="updateMemory(${memory.id}, 'type', this.value)">
                                <option value="preference" ${memory.type === 'preference' ? 'selected' : ''}>偏好</option>
                                <option value="experience" ${memory.type === 'experience' ? 'selected' : ''}>经历</option>
                                <option value="important_date" ${memory.type === 'important_date' ? 'selected' : ''}>重要日期</option>
                                <option value="custom" ${memory.type === 'custom' ? 'selected' : ''}>自定义</option>
                            </select>
                            <label class="checkbox-label">
                                <input type="checkbox" ${memory.isActive ? 'checked' : ''} onchange="toggleMemoryActive(${memory.id})">
                                激活
                            </label>
                        </div>
                    </div>
                    <div class="memory-item-actions">
                        <button class="button button-small button-danger" onclick="deleteMemory(${memory.id})">删除</button>
                    </div>
                </div>
            `).join('');
        }

        var memoryCountEl = document.getElementById('memory-count');
        var memoryActiveCountEl = document.getElementById('memory-active-count');
        if (memoryCountEl) memoryCountEl.textContent = currentAgentMemories.length;
        if (memoryActiveCountEl) memoryActiveCountEl.textContent = currentAgentMemories.filter(m => m.isActive).length;
    }

    function addNamingRelation() {
        var agents = Store.getRef('agents');
        var editingAgentId = Store.getState('editingAgentId');
        var otherAgents = agents.filter(a => a.id !== editingAgentId);
        if (otherAgents.length === 0) {
            UI.showToast('没有其他智能体可以设置称呼');
            return;
        }

        const availableAgent = otherAgents.find(a => !currentAgentNamingRelations[a.id]);
        if (!availableAgent) {
            UI.showToast('已为所有智能体设置了称呼');
            return;
        }

        currentAgentNamingRelations[availableAgent.id] = availableAgent.name;
        renderNamingRelations();
    }

    function updateNamingRelation(agentId, value) {
        currentAgentNamingRelations[agentId] = value;
    }

    function removeNamingRelation(agentId) {
        delete currentAgentNamingRelations[agentId];
        renderNamingRelations();
    }

    function renderNamingRelations() {
        const container = document.getElementById('naming-relations-list');
        const addBtn = document.getElementById('add-naming-btn');

        if (!container) return;

        var agents = Store.getRef('agents');
        var editingAgentId = Store.getState('editingAgentId');
        var otherAgents = agents.filter(a => a.id !== editingAgentId);
        var entries = Object.entries(currentAgentNamingRelations);

        if (entries.length === 0) {
            container.innerHTML = '<p class="hint-text" style="padding: 10px;">暂无称呼关系，点击下方按钮添加</p>';
        } else {
            container.innerHTML = entries.map(([agentId, naming]) => {
                return `
                    <div class="naming-relation-item">
                        <span>对</span>
                        <select class="form-select" style="width: auto;" onchange="updateNamingRelation('${agentId}', this.value)">
                            ${otherAgents.map(a => `
                                <option value="${a.id}" ${a.id === agentId ? 'selected' : ''}>${a.name}</option>
                            `).join('')}
                        </select>
                        <span>的称呼：</span>
                        <input type="text" class="form-input" value="${naming}" placeholder="输入称呼" maxlength="20" onchange="updateNamingRelation('${agentId}', this.value)">
                        <button class="button button-small button-danger" onclick="removeNamingRelation('${agentId}')">×</button>
                    </div>
                `;
            }).join('');
        }

        if (addBtn) {
            const hasAvailable = otherAgents.some(a => !currentAgentNamingRelations[a.id]);
            addBtn.style.display = hasAvailable ? 'inline-block' : 'none';
        }
    }

    function updateAvatarConfig() {
        const type = document.querySelector('input[name="avatar-type"]:checked').value;
        currentAgentAvatar.type = type;

        document.getElementById('avatar-preset-section').style.display = type === 'preset' ? 'block' : 'none';
        document.getElementById('avatar-custom-section').style.display = type === 'custom' ? 'block' : 'none';

        updateAvatarPreview();
    }

    function selectPresetCharacter(characterId) {
        currentAgentAvatar.characterId = characterId;
        document.querySelectorAll('.preset-character-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.preset-character-item[data-id="${characterId}"]`)?.classList.add('active');
        updateAvatarPreview();
    }

    function renderPresetCharacters() {
        const container = document.getElementById('preset-characters-grid');
        if (!container) return;

        const characters = [
            { id: 'female_adventurer', name: '小雅', color: '#FF6B9D', emoji: '👩' },
            { id: 'male_adventurer', name: '小宇', color: '#4A90D9', emoji: '👨' },
            { id: 'female_person', name: '小琳', color: '#9B59B6', emoji: '👧' }
        ];

        container.innerHTML = characters.map(char => `
            <div class="preset-character-item ${char.id === currentAgentAvatar.characterId ? 'active' : ''}"
                 data-id="${char.id}"
                 onclick="selectPresetCharacter('${char.id}')">
                <div class="preset-character-avatar" style="background-color: ${char.color}">${char.emoji}</div>
                <span class="preset-character-name">${char.name}</span>
            </div>
        `).join('');
    }

    function updateAvatarPreview() {
        const preview = document.getElementById('avatar-preview-circle');
        const text = document.getElementById('avatar-preview-text');
        const nameInput = document.getElementById('agent-name');

        if (preview && text && nameInput) {
            text.textContent = nameInput.value.charAt(0) || '小';

            if (currentAgentAvatar.type === 'custom') {
                const colorInput = document.getElementById('agent-avatar-color');
                preview.style.backgroundColor = colorInput?.value || '#FF6B9D';
            } else {
                const characters = {
                    'female_adventurer': '#FF6B9D',
                    'male_adventurer': '#4A90D9',
                    'female_person': '#9B59B6'
                };
                preview.style.backgroundColor = characters[currentAgentAvatar.characterId] || '#FF6B9D';
            }
        }
    }

    function exportAgentConfig() {
        var editingAgentId = Store.getState('editingAgentId');
        if (!editingAgentId) {
            UI.showToast('请先保存智能体后再导出');
            return;
        }

        var agents = Store.getRef('agents');
        var agent = agents.find(a => a.id === editingAgentId);
        if (!agent) {
            UI.showToast('智能体不存在');
            return;
        }

        const config = {
            ...agent,
            memories: currentAgentMemories,
            namingRelations: currentAgentNamingRelations,
            avatar: currentAgentAvatar,
            exportedAt: new Date().toISOString()
        };

        const data = JSON.stringify(config, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent-${agent.name}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        UI.showToast('配置已导出');
    }

    function importAgentConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);

                if (config.name) {
                    document.getElementById('agent-name').value = config.name;
                }
                if (config.personality) {
                    document.getElementById('agent-personality').value = config.personality;
                }
                if (config.habits) {
                    document.getElementById('agent-habits').value = config.habits;
                }
                if (config.style) {
                    document.getElementById('agent-style').value = config.style;
                }
                if (config.systemPrompt) {
                    document.getElementById('agent-system-prompt').value = config.systemPrompt;
                }

                if (config.memories && Array.isArray(config.memories)) {
                    currentAgentMemories = config.memories;
                    renderAgentMemoryList();
                }

                if (config.namingRelations) {
                    currentAgentNamingRelations = config.namingRelations;
                    renderNamingRelations();
                }

                if (config.avatar) {
                    currentAgentAvatar = config.avatar;
                    document.querySelector(`input[name="avatar-type"][value="${config.avatar.type}"]`).checked = true;
                    updateAvatarConfig();
                }

                updateCharCounts();
                updateAvatarPreview();
                UI.showToast('配置已导入');
            } catch (error) {
                UI.showToast('导入失败: 无效的配置文件');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    function shareAgent(agentId) {
        var agents = Store.getRef('agents');
        var agent = agents.find(a => a.id === agentId);
        if (!agent) {
            UI.showToast('智能体不存在');
            return;
        }

        const shareData = {
            name: agent.name,
            personality: agent.personality,
            habits: agent.habits,
            style: agent.style,
            systemPrompt: agent.systemPrompt || ''
        };

        try {
            const jsonString = JSON.stringify(shareData);
            const base64String = btoa(unescape(encodeURIComponent(jsonString)));
            const shareCode = 'LCAGENT' + base64String;

            document.getElementById('share-agent-name').textContent = agent.name;
            document.getElementById('share-code-display').value = shareCode;
            document.getElementById('share-agent-modal').classList.add('show');

        } catch (error) {
            console.error('生成分享码失败', error);
            UI.showToast('生成分享码失败');
        }
    }

    function closeShareAgentDialog() {
        document.getElementById('share-agent-modal').classList.remove('show');
    }

    async function copyShareCode() {
        const shareCode = document.getElementById('share-code-display').value;

        try {
            await navigator.clipboard.writeText(shareCode);
            UI.showToast('分享码已复制到剪贴板');
        } catch (error) {
            const textarea = document.getElementById('share-code-display');
            textarea.select();
            document.execCommand('copy');
            UI.showToast('分享码已复制到剪贴板');
        }
    }

    function showImportShareCodeDialog() {
        document.getElementById('import-share-code-input').value = '';
        document.getElementById('import-preview').style.display = 'none';
        document.getElementById('import-share-code-modal').classList.add('show');
    }

    function closeImportShareCodeDialog() {
        document.getElementById('import-share-code-modal').classList.remove('show');
    }

    function decodeAndPreviewShareCode() {
        const shareCode = document.getElementById('import-share-code-input').value.trim();

        if (!shareCode) {
            document.getElementById('import-preview').style.display = 'none';
            return;
        }

        if (!shareCode.startsWith('LCAGENT')) {
            UI.showToast('无效的分享码格式');
            document.getElementById('import-preview').style.display = 'none';
            return;
        }

        try {
            const base64String = shareCode.substring(7);
            const jsonString = decodeURIComponent(escape(atob(base64String)));
            const shareData = JSON.parse(jsonString);

            if (!shareData.name || !shareData.personality) {
                UI.showToast('分享码数据不完整');
                document.getElementById('import-preview').style.display = 'none';
                return;
            }

            var styleNames = App.Constants.STYLE_NAMES;

            document.getElementById('preview-agent-name').textContent = shareData.name;
            document.getElementById('preview-agent-personality').textContent = shareData.personality;
            document.getElementById('preview-agent-style').textContent = styleNames[shareData.style] || '温暖关怀';
            document.getElementById('import-preview').style.display = 'block';

        } catch (error) {
            console.error('解码分享码失败', error);
            UI.showToast('分享码格式错误');
            document.getElementById('import-preview').style.display = 'none';
        }
    }

    function importShareCode() {
        const shareCode = document.getElementById('import-share-code-input').value.trim();

        if (!shareCode) {
            UI.showToast('请输入分享码');
            return;
        }

        if (!shareCode.startsWith('LCAGENT')) {
            UI.showToast('无效的分享码格式');
            return;
        }

        try {
            const base64String = shareCode.substring(7);
            const jsonString = decodeURIComponent(escape(atob(base64String)));
            const shareData = JSON.parse(jsonString);

            if (!shareData.name || !shareData.personality) {
                UI.showToast('分享码数据不完整');
                return;
            }

            var agents = Store.getRef('agents');
            var existingAgent = agents.find(a => a.name === shareData.name);
            if (existingAgent) {
                if (!confirm(`已存在名为"${shareData.name}"的智能体，是否覆盖？`)) {
                    return;
                }
                existingAgent.personality = shareData.personality;
                existingAgent.habits = shareData.habits || '';
                existingAgent.style = shareData.style || 'warm';
                existingAgent.systemPrompt = shareData.systemPrompt || '';
                existingAgent.updatedAt = new Date().toISOString();
                UI.showToast('智能体已更新');
            } else {
                const newAgent = {
                    id: 'agent_' + Date.now(),
                    name: shareData.name,
                    personality: shareData.personality,
                    habits: shareData.habits || '',
                    style: shareData.style || 'warm',
                    systemPrompt: shareData.systemPrompt || '',
                    isLocked: false,
                    isDefault: false,
                    createdAt: new Date().toISOString()
                };
                agents.push(newAgent);
                UI.showToast('智能体导入成功');
            }

            App.Storage.save();
            renderAgentList();
            closeImportShareCodeDialog();

        } catch (error) {
            console.error('导入分享码失败', error);
            UI.showToast('分享码格式错误');
        }
    }

    function init() {
        var importInput = document.getElementById('import-share-code-input');
        if (importInput) {
            importInput.addEventListener('input', function() {
                clearTimeout(importInput.decodeTimer);
                importInput.decodeTimer = setTimeout(function() {
                    decodeAndPreviewShareCode();
                }, 500);
            });
        }
    }

    var Agent = {
        loadAgentsFromAPI: loadAgentsFromAPI,
        initDefaultAgents: initDefaultAgents,
        renderAgentList: renderAgentList,
        selectAgent: selectAgent,
        showAgentSwitchDialog: showAgentSwitchDialog,
        showAddAgentDialog: showAddAgentDialog,
        editAgent: editAgent,
        saveAgent: saveAgent,
        deleteAgent: deleteAgent,
        closeAgentDialog: closeAgentDialog,
        getCurrentAgentSystemPrompt: getCurrentAgentSystemPrompt,
        generateSystemPrompt: generateSystemPrompt,
        showAgentSelector: showAgentSelector,
        closeAgentSelector: closeAgentSelector,
        updateChatTitle: updateChatTitle,
        switchAgentTab: switchAgentTab,
        applyTemplate: applyTemplate,
        updateCharCounts: updateCharCounts,
        addMemory: addMemory,
        updateMemory: updateMemory,
        deleteMemory: deleteMemory,
        toggleMemoryActive: toggleMemoryActive,
        renderAgentMemoryList: renderAgentMemoryList,
        addNamingRelation: addNamingRelation,
        updateNamingRelation: updateNamingRelation,
        removeNamingRelation: removeNamingRelation,
        renderNamingRelations: renderNamingRelations,
        updateAvatarConfig: updateAvatarConfig,
        selectPresetCharacter: selectPresetCharacter,
        renderPresetCharacters: renderPresetCharacters,
        updateAvatarPreview: updateAvatarPreview,
        exportAgentConfig: exportAgentConfig,
        importAgentConfig: importAgentConfig,
        shareAgent: shareAgent,
        closeShareAgentDialog: closeShareAgentDialog,
        copyShareCode: copyShareCode,
        showImportShareCodeDialog: showImportShareCodeDialog,
        closeImportShareCodeDialog: closeImportShareCodeDialog,
        importShareCode: importShareCode,
        decodeAndPreviewShareCode: decodeAndPreviewShareCode,
        init: init
    };

    global.App = global.App || {};
    global.App.Agent = Agent;

    global.loadAgentsFromAPI = loadAgentsFromAPI;
    global.initDefaultAgents = initDefaultAgents;
    global.renderAgentList = renderAgentList;
    global.selectAgent = selectAgent;
    global.showAgentSwitchDialog = showAgentSwitchDialog;
    global.showAddAgentDialog = showAddAgentDialog;
    global.editAgent = editAgent;
    global.saveAgent = saveAgent;
    global.deleteAgent = deleteAgent;
    global.closeAgentDialog = closeAgentDialog;
    global.getCurrentAgentSystemPrompt = getCurrentAgentSystemPrompt;
    global.generateSystemPrompt = generateSystemPrompt;
    global.showAgentSelector = showAgentSelector;
    global.closeAgentSelector = closeAgentSelector;
    global.updateChatTitle = updateChatTitle;
    global.switchAgentTab = switchAgentTab;
    global.applyTemplate = applyTemplate;
    global.updateCharCounts = updateCharCounts;
    global.addMemory = addMemory;
    global.updateMemory = updateMemory;
    global.deleteMemory = deleteMemory;
    global.toggleMemoryActive = toggleMemoryActive;
    global.addNamingRelation = addNamingRelation;
    global.updateNamingRelation = updateNamingRelation;
    global.removeNamingRelation = removeNamingRelation;
    global.updateAvatarConfig = updateAvatarConfig;
    global.selectPresetCharacter = selectPresetCharacter;
    global.exportAgentConfig = exportAgentConfig;
    global.importAgentConfig = importAgentConfig;
    global.shareAgent = shareAgent;
    global.closeShareAgentDialog = closeShareAgentDialog;
    global.copyShareCode = copyShareCode;
    global.showImportShareCodeDialog = showImportShareCodeDialog;
    global.closeImportShareCodeDialog = closeImportShareCodeDialog;
    global.importShareCode = importShareCode;
    global.decodeAndPreviewShareCode = decodeAndPreviewShareCode;

})(window);
