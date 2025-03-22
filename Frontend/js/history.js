/**
 * history.js - 负责Hex游戏的历史记录和回溯功能
 */

class HexHistory {
    constructor(game) {
        this.game = game;
        this.movesList = document.getElementById('moves-list');
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 注册游戏事件回调
        this.game.onMoveAdded = this.onMoveAdded.bind(this);
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 清空历史记录列表
        if (this.movesList) {
            this.movesList.innerHTML = '';
        }
    }

    /**
     * 处理移动添加事件
     */
    onMoveAdded(move, index) {
        if (!this.movesList) return;
        
        // 创建移动项
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        moveItem.dataset.index = index;
        
        // 设置移动项内容
        let moveText = '';
        if (move.swapUsed) {
            // 如果使用了交换规则
            const originalPos = this.getPositionNotation(move.position.q, move.position.r);
            const newPos = this.getPositionNotation(move.newPosition.q, move.newPosition.r);
            moveText = `${move.moveNumber}. ${move.player === 'red' ? '红' : '蓝'} ${originalPos} → ${newPos} (交换)`;
        } else {
            // 普通移动
            const pos = this.getPositionNotation(move.position.q, move.position.r);
            moveText = `${move.moveNumber}. ${move.player === 'red' ? '红' : '蓝'} ${pos}`;
        }
        
        moveItem.textContent = moveText;
        
        // 添加点击事件
        moveItem.addEventListener('click', () => {
            this.goToMove(index);
        });
        
        // 添加到列表
        this.movesList.appendChild(moveItem);
        
        // 滚动到底部
        this.movesList.scrollTop = this.movesList.scrollHeight;
        
        // 更新当前移动项高亮
        this.updateCurrentMoveHighlight(index);
    }

    /**
     * 获取位置表示法（例如：a1, b2等）
     */
    getPositionNotation(q, r) {
        const col = String.fromCharCode(97 + q); // a, b, c, ...
        const row = r + 1; // 1, 2, 3, ...
        return `${col}${row}`;
    }

    /**
     * 跳转到指定移动
     */
    goToMove(index) {
        // 调用游戏的历史跳转方法
        this.game.goToHistoryMove(index);
        
        // 更新当前移动项高亮
        this.updateCurrentMoveHighlight(index);
    }

    /**
     * 更新当前移动项高亮
     */
    updateCurrentMoveHighlight(index) {
        if (!this.movesList) return;
        
        // 移除所有高亮
        const items = this.movesList.querySelectorAll('.move-item');
        items.forEach(item => {
            item.classList.remove('current');
        });
        
        // 添加当前项高亮
        const currentItem = this.movesList.querySelector(`.move-item[data-index="${index}"]`);
        if (currentItem) {
            currentItem.classList.add('current');
        }
    }

    /**
     * 清空历史记录
     */
    clearHistory() {
        if (this.movesList) {
            this.movesList.innerHTML = '';
        }
    }
}