/**
 * game.js - 负责Hex游戏的核心逻辑
 */

class HexGame {
    constructor(board, options = {}) {
        // 默认选项
        this.options = {
            firstPlayer: 'red',      // 先手玩家: 'red' 或 'blue'
            gameMode: 'human-human', // 游戏模式: 'human-human' 或 'human-ai'
            aiDifficulty: 'medium',  // AI难度: 'easy', 'medium', 或 'hard'
            ...options
        };

        // 游戏棋盘
        this.board = board;
        
        // 游戏状态
        this.currentPlayer = this.options.firstPlayer;
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.swapRule = false;       // 是否已使用交换规则
        this.swapAvailable = false;  // 是否可以使用交换规则
        
        // 历史记录
        this.history = [];
        this.currentHistoryIndex = -1;
        
        // 事件回调
        this.onGameStateChange = null;
        this.onMoveAdded = null;
        
        // 初始化游戏
        this.initGame();
    }

    /**
     * 初始化游戏
     */
    initGame() {
        // 重置游戏状态
        this.currentPlayer = this.options.firstPlayer;
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.swapRule = false;
        this.swapAvailable = false;
        
        // 清空历史记录
        this.history = [];
        this.currentHistoryIndex = -1;
        
        // 清空棋盘
        this.board.initBoard();
        
        // 添加棋盘点击事件
        this.addBoardEventListeners();
        
        // 更新游戏状态
        this.updateGameState();
    }

    /**
     * 添加棋盘事件监听
     */
    addBoardEventListeners() {
        // 移除现有事件监听
        this.board.cells.forEach(cell => {
            cell.removeEventListener('click', this.handleCellClick);
        });
        
        // 添加新的事件监听
        this.board.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
    }

    /**
     * 处理格子点击事件
     */
    handleCellClick(event) {
        if (this.gameOver) return;
        
        // 获取点击的格子坐标
        const cell = event.currentTarget;
        const q = parseInt(cell.dataset.q);
        const r = parseInt(cell.dataset.r);
        
        // 检查坐标是否有效
        if (isNaN(q) || isNaN(r) || q < 0 || r < 0 || q >= this.board.options.size || r >= this.board.options.size) return;
        
        // 检查格子是否已被占用
        if (this.board.boardData[r] && this.board.boardData[r][q] !== null) return;
        
        // 执行移动
        this.makeMove(q, r);
        
        // 如果是人机对战模式，且当前玩家是AI，则执行AI移动
        if (this.options.gameMode === 'human-ai' && !this.gameOver && this.currentPlayer !== this.options.firstPlayer) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    /**
     * 执行移动
     */
    makeMove(q, r) {
        // 检查游戏是否已结束
        if (this.gameOver) return false;
        
        // 检查格子是否已被占用
        if (this.board.boardData[r][q] !== null) return false;
        
        // 记录移动
        this.board.boardData[r][q] = this.currentPlayer;
        
        // 更新格子样式
        const cell = this.board.cells.find(cell => 
            parseInt(cell.dataset.q) === q && parseInt(cell.dataset.r) === r
        );
        if (cell) {
            cell.classList.add(this.currentPlayer);
            // 更新棋子颜色
            const polygon = cell.querySelector('polygon');
            if (polygon) {
                polygon.setAttribute('fill', this.currentPlayer === 'red' ? this.board.options.redColor : this.board.options.blueColor);
            }
        }
        
        // 增加移动计数
        this.moveCount++;
        
        // 检查是否为第一步移动（用于交换规则）
        if (this.moveCount === 1) {
            this.swapAvailable = true;
            this.firstMovePosition = { q, r };
        } else {
            this.swapAvailable = false;
        }
        
        // 添加到历史记录
        this.addToHistory({
            player: this.currentPlayer,
            position: { q, r },
            moveNumber: this.moveCount,
            swapUsed: false
        });
        
        // 检查胜利条件
        if (this.checkWin(this.currentPlayer)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
        } else {
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        }
        
        // 更新游戏状态
        this.updateGameState();
        
        return true;
    }

    /**
     * 执行交换规则
     */
    swapFirstMove() {
        // 检查是否可以使用交换规则
        if (!this.swapAvailable || this.moveCount !== 1 || this.gameOver) return false;
        
        // 获取第一步移动的位置
        const { q, r } = this.firstMovePosition;
        
        // 移除原来的棋子
        this.board.boardData[r][q] = null;
        const originalCell = this.board.cells.find(cell => 
            parseInt(cell.dataset.q) === q && parseInt(cell.dataset.r) === r
        );
        if (originalCell) {
            originalCell.classList.remove('red', 'blue');
        }
        
        // 计算对角线位置
        const size = this.board.options.size;
        const newQ = size - 1 - q;
        const newR = size - 1 - r;
        
        // 放置新棋子
        this.board.boardData[newR][newQ] = this.currentPlayer;
        const newCell = this.board.cells.find(cell => 
            parseInt(cell.dataset.q) === newQ && parseInt(cell.dataset.r) === newR
        );
        if (newCell) {
            newCell.classList.add(this.currentPlayer);
            // 更新棋子颜色
            const polygon = newCell.querySelector('polygon');
            if (polygon) {
                polygon.setAttribute('fill', this.currentPlayer === 'red' ? this.board.options.redColor : this.board.options.blueColor);
            }
        }
        
        // 更新历史记录
        this.history[0].swapUsed = true;
        this.history[0].newPosition = { q: newQ, r: newR };
        
        // 标记交换规则已使用
        this.swapRule = true;
        this.swapAvailable = false;
        
        // 更新游戏状态
        this.updateGameState();
        
        return true;
    }

    /**
     * 添加到历史记录
     */
    addToHistory(move) {
        // 如果当前不在历史记录的最后，则删除后面的记录
        if (this.currentHistoryIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentHistoryIndex + 1);
        }
        
        // 添加新的移动记录
        this.history.push(move);
        this.currentHistoryIndex = this.history.length - 1;
        
        // 触发移动添加事件
        if (this.onMoveAdded) {
            this.onMoveAdded(move, this.history.length - 1);
        }
    }

    /**
     * 检查胜利条件
     */
    checkWin(player) {
        const size = this.board.options.size;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        
        // 检查红方是否连接左右边界
        if (player === 'red') {
            // 检查第一列的每个红色格子
            for (let r = 0; r < size; r++) {
                if (this.board.boardData[r][0] === 'red' && !visited[r][0]) {
                    if (this.dfs(0, r, 'red', visited, 'horizontal')) {
                        return true;
                    }
                }
            }
        }
        // 检查蓝方是否连接上下边界
        else if (player === 'blue') {
            // 检查第一行的每个蓝色格子
            for (let q = 0; q < size; q++) {
                if (this.board.boardData[0][q] === 'blue' && !visited[0][q]) {
                    if (this.dfs(q, 0, 'blue', visited, 'vertical')) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * 深度优先搜索检查连通性
     */
    dfs(q, r, player, visited, direction) {
        const size = this.board.options.size;
        
        // 标记当前格子为已访问
        visited[r][q] = true;
        
        // 检查是否到达对面边界
        if ((direction === 'horizontal' && q === size - 1) || 
            (direction === 'vertical' && r === size - 1)) {
            return true;
        }
        
        // 六边形的六个相邻方向
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, -1]
        ];
        
        // 检查所有相邻格子
        for (const [dq, dr] of directions) {
            const newQ = q + dq;
            const newR = r + dr;
            
            // 检查边界
            if (newQ >= 0 && newQ < size && newR >= 0 && newR < size) {
                // 检查是否是同一玩家的格子且未访问过
                if (this.board.boardData[newR][newQ] === player && !visited[newR][newQ]) {
                    if (this.dfs(newQ, newR, player, visited, direction)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * 执行AI移动
     */
    makeAIMove() {
        // 检查游戏是否已结束
        if (this.gameOver) return;
        
        // 根据难度选择AI算法
        let move;
        switch (this.options.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumAIMove();
                break;
            case 'hard':
                // 这里应该调用后端的高级AI算法
                move = this.getRandomMove(); // 临时使用随机移动
                break;
            default:
                move = this.getRandomMove();
        }
        
        // 执行移动
        if (move) {
            this.makeMove(move.q, move.r);
        }
    }

    /**
     * 获取随机移动（简单AI）
     */
    getRandomMove() {
        const size = this.board.options.size;
        const emptyPositions = [];
        
        // 收集所有空格子
        for (let r = 0; r < size; r++) {
            for (let q = 0; q < size; q++) {
                if (this.board.boardData[r][q] === null) {
                    emptyPositions.push({ q, r });
                }
            }
        }
        
        // 随机选择一个空格子
        if (emptyPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyPositions.length);
            return emptyPositions[randomIndex];
        }
        
        return null;
    }

    /**
     * 获取中等难度AI移动
     */
    getMediumAIMove() {
        // 这里可以实现一个简单的启发式算法
        // 例如：优先选择能够连接已有棋子的位置
        
        // 临时使用随机移动
        return this.getRandomMove();
    }

    /**
     * 更新游戏状态
     */
    updateGameState() {
        // 更新状态消息
        const statusMessage = document.getElementById('status-message');
        const swapButton = document.getElementById('swap-btn');
        
        // 更新玩家状态高亮
        const redPlayer = document.querySelector('.player.red');
        const bluePlayer = document.querySelector('.player.blue');
        
        if (redPlayer && bluePlayer) {
            redPlayer.classList.toggle('current', this.currentPlayer === 'red' && !this.gameOver);
            bluePlayer.classList.toggle('current', this.currentPlayer === 'blue' && !this.gameOver);
        }
        
        if (statusMessage) {
            if (this.gameOver) {
                statusMessage.textContent = `游戏结束，${this.winner === 'red' ? '红方' : '蓝方'}获胜！`;
                if (swapButton) swapButton.style.display = 'none';
                
                // 高亮显示胜利路径
                this.highlightWinningPath();
            } else {
                statusMessage.textContent = `当前回合：${this.currentPlayer === 'red' ? '红方' : '蓝方'}`;
                
                // 显示/隐藏交换按钮
                if (swapButton) {
                    swapButton.style.display = this.swapAvailable ? 'inline-block' : 'none';
                }
            }
        }
        
        // 触发游戏状态变化事件
        if (this.onGameStateChange) {
            this.onGameStateChange({
                currentPlayer: this.currentPlayer,
                gameOver: this.gameOver,
                winner: this.winner,
                moveCount: this.moveCount,
                swapAvailable: this.swapAvailable
            });
        }
    }

    /**
     * 跳转到历史记录中的某一步
     */
    goToHistoryMove(index) {
        if (index < 0 || index >= this.history.length) return false;
        
        // 重置棋盘
        this.board.initBoard();
        
        // 重置游戏状态
        this.currentPlayer = this.options.firstPlayer;
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.swapRule = false;
        this.swapAvailable = false;
        
        // 重放历史记录到指定步骤
        for (let i = 0; i <= index; i++) {
            const move = this.history[i];
            
            // 检查是否使用了交换规则
            if (i === 0 && move.swapUsed && move.newPosition) {
                // 先执行第一步移动
                this.makeMove(move.position.q, move.position.r, true);
                
                // 然后执行交换规则
                this.swapFirstMove();
            } else {
                // 普通移动
                this.makeMove(move.position.q, move.position.r, true);
            }
        }
        
        // 更新当前历史索引
        this.currentHistoryIndex = index;
        
        // 更新游戏状态
        this.updateGameState();
        
        return true;
    }
    
    /**
     * 执行移动（带有重放选项）
     */
    makeMove(q, r, isReplay = false) {
        // 检查游戏是否已结束
        if (this.gameOver && !isReplay) return false;
        
        // 检查格子是否已被占用
        if (this.board.boardData[r][q] !== null) return false;
        
        // 记录移动
        this.board.boardData[r][q] = this.currentPlayer;
        
        // 更新格子样式
        const cell = this.board.cells.find(cell => 
            parseInt(cell.dataset.q) === q && parseInt(cell.dataset.r) === r
        );
        if (cell) {
            cell.classList.add(this.currentPlayer);
            // 更新棋子颜色
            const polygon = cell.querySelector('polygon');
            if (polygon) {
                polygon.setAttribute('fill', this.currentPlayer === 'red' ? this.board.options.redColor : this.board.options.blueColor);
            }
        }
        
        // 增加移动计数
        this.moveCount++;
        
        // 检查是否为第一步移动（用于交换规则）
        if (this.moveCount === 1) {
            this.swapAvailable = true;
            this.firstMovePosition = { q, r };
        } else {
            this.swapAvailable = false;
        }
        
        // 添加到历史记录（如果不是重放）
        if (!isReplay) {
            this.addToHistory({
                player: this.currentPlayer,
                position: { q, r },
                moveNumber: this.moveCount,
                swapUsed: false
            });
        }
        
        // 检查胜利条件
        if (this.checkWin(this.currentPlayer)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
        } else {
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        }
        
        // 更新游戏状态
        this.updateGameState();
        
        return true;
    }
    
    /**
     * 高亮显示胜利路径
     */
    highlightWinningPath() {
        if (!this.gameOver || !this.winner) return;
        
        const size = this.board.options.size;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const path = [];
        
        // 找到起始点
        if (this.winner === 'red') {
            // 红方连接左右边界
            for (let r = 0; r < size; r++) {
                if (this.board.boardData[r][0] === 'red') {
                    this.findWinningPath(0, r, 'red', visited, path);
                    break;
                }
            }
        } else {
            // 蓝方连接上下边界
            for (let q = 0; q < size; q++) {
                if (this.board.boardData[0][q] === 'blue') {
                    this.findWinningPath(q, 0, 'blue', visited, path);
                    break;
                }
            }
        }
        
        // 高亮路径上的格子
        path.forEach(pos => {
            const cell = this.board.cells.find(cell => 
                parseInt(cell.dataset.q) === pos.q && parseInt(cell.dataset.r) === pos.r
            );
            if (cell) {
                cell.classList.add('winning-path');
            }
        });
    }
    
    /**
     * 寻找胜利路径
     */
    findWinningPath(q, r, player, visited, path) {
        const size = this.board.options.size;
        
        // 标记当前格子为已访问
        visited[r][q] = true;
        path.push({ q, r });
        
        // 检查是否到达对面边界
        if ((player === 'red' && q === size - 1) || 
            (player === 'blue' && r === size - 1)) {
            return true;
        }
        
        // 六边形的六个相邻方向
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, -1]
        ];
        
        // 检查所有相邻格子
        for (const [dq, dr] of directions) {
            const newQ = q + dq;
            const newR = r + dr;
            
            // 检查边界
            if (newQ >= 0 && newQ < size && newR >= 0 && newR < size) {
                // 检查是否是同一玩家的格子且未访问过
                if (this.board.boardData[newR][newQ] === player && !visited[newR][newQ]) {
                    if (this.findWinningPath(newQ, newR, player, visited, path)) {
                        return true;
                    }
                }
            }
        }
        
        // 如果当前路径不是胜利路径，则移除
        path.pop();
        return false;
    }
}