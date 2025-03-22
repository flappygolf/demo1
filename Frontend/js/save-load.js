/**
 * save-load.js - 负责Hex游戏的棋谱保存和加载功能
 */

class HexSaveLoad {
    constructor(game) {
        this.game = game;
        
        // 获取按钮元素
        this.saveButton = document.getElementById('save-game-btn');
        this.loadButton = document.getElementById('load-game-btn');
        
        // 初始化事件监听
        this.initEventListeners();
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 保存棋谱按钮
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => {
                this.saveGame();
            });
        }
        
        // 加载棋谱按钮
        if (this.loadButton) {
            this.loadButton.addEventListener('click', () => {
                this.loadGame();
            });
        }
    }

    /**
     * 保存游戏棋谱
     */
    saveGame() {
        try {
            // 检查是否有移动记录
            if (this.game.history.length === 0) {
                alert('没有可保存的棋谱，请先进行游戏。');
                return;
            }
            
            // 创建游戏数据对象
            const gameData = {
                boardSize: this.game.board.options.size,
                firstPlayer: this.game.options.firstPlayer,
                gameMode: this.game.options.gameMode,
                aiDifficulty: this.game.options.aiDifficulty,
                moves: this.game.history,
                gameState: {
                    currentPlayer: this.game.currentPlayer,
                    gameOver: this.game.gameOver,
                    winner: this.game.winner,
                    moveCount: this.game.moveCount,
                    swapRule: this.game.swapRule,
                    swapAvailable: this.game.swapAvailable
                },
                boardOptions: {
                    redColor: this.game.board.options.redColor,
                    blueColor: this.game.board.options.blueColor,
                    boardColor: this.game.board.options.boardColor,
                    cellSize: this.game.board.options.cellSize,
                    orientation: this.game.board.options.orientation
                }
            };
            
            // 转换为JSON字符串
            const gameDataJson = JSON.stringify(gameData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([gameDataJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // 创建下载元素
            const a = document.createElement('a');
            a.href = url;
            a.download = `hex_game_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a);
            
            // 触发下载
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            // 提示用户
            alert('棋谱保存成功！');
        } catch (error) {
            console.error('保存棋谱失败:', error);
            alert('保存棋谱失败，请稍后再试。');
        }
    }

    /**
     * 加载游戏棋谱
     */
    loadGame() {
        // 创建文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // 添加文件选择事件
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // 解析JSON数据
                    const gameData = JSON.parse(e.target.result);
                    
                    // 加载游戏设置
                    this.loadGameSettings(gameData);
                    
                    // 加载棋盘样式
                    this.loadBoardStyle(gameData.boardOptions);
                    
                    // 重放移动
                    this.replayMoves(gameData.moves);
                } catch (error) {
                    console.error('加载棋谱失败:', error);
                    alert('加载棋谱失败，请检查文件格式是否正确。');
                }
            };
            reader.readAsText(file);
            
            // 清理
            document.body.removeChild(fileInput);
        });
        
        // 触发文件选择
        fileInput.click();
    }

    /**
     * 加载游戏设置
     */
    loadGameSettings(gameData) {
        // 更新棋盘大小选择器
        const boardSizeSelect = document.getElementById('board-size');
        if (boardSizeSelect) {
            boardSizeSelect.value = gameData.boardSize;
        }
        
        // 更新游戏模式选择器
        const gameModeSelect = document.getElementById('game-mode');
        if (gameModeSelect) {
            gameModeSelect.value = gameData.gameMode;
            
            // 显示/隐藏AI选项
            const aiOptions = document.querySelector('.ai-options');
            if (aiOptions) {
                aiOptions.style.display = gameData.gameMode === 'human-ai' ? 'flex' : 'none';
            }
        }
        
        // 更新AI难度选择器
        const aiDifficultySelect = document.getElementById('ai-difficulty');
        if (aiDifficultySelect && gameData.aiDifficulty) {
            aiDifficultySelect.value = gameData.aiDifficulty;
        }
        
        // 更新先手选择器
        const firstPlayerSelect = document.getElementById('first-player');
        if (firstPlayerSelect) {
            firstPlayerSelect.value = gameData.firstPlayer;
        }
        
        // 更新游戏选项
        this.game.options.firstPlayer = gameData.firstPlayer;
        this.game.options.gameMode = gameData.gameMode;
        if (gameData.aiDifficulty) {
            this.game.options.aiDifficulty = gameData.aiDifficulty;
        }
        
        // 更新棋盘大小
        this.game.board.options.size = gameData.boardSize;
    }

    /**
     * 加载棋盘样式
     */
    loadBoardStyle(boardOptions) {
        if (!boardOptions) return;
        
        // 更新颜色选择器
        const redColorInput = document.getElementById('red-color');
        const blueColorInput = document.getElementById('blue-color');
        const boardColorInput = document.getElementById('board-color');
        const cellSizeInput = document.getElementById('cell-size');
        const boardOrientationSelect = document.getElementById('board-orientation');
        
        if (redColorInput && boardOptions.redColor) {
            redColorInput.value = boardOptions.redColor;
            this.game.board.options.redColor = boardOptions.redColor;
        }
        
        if (blueColorInput && boardOptions.blueColor) {
            blueColorInput.value = boardOptions.blueColor;
            this.game.board.options.blueColor = boardOptions.blueColor;
        }
        
        if (boardColorInput && boardOptions.boardColor) {
            boardColorInput.value = boardOptions.boardColor;
            this.game.board.options.boardColor = boardOptions.boardColor;
        }
        
        if (cellSizeInput && boardOptions.cellSize) {
            cellSizeInput.value = boardOptions.cellSize;
            this.game.board.options.cellSize = boardOptions.cellSize;
        }
        
        if (boardOrientationSelect && boardOptions.orientation) {
            boardOrientationSelect.value = boardOptions.orientation;
            this.game.board.options.orientation = boardOptions.orientation;
        }
    }

    /**
     * 重放移动
     */
    replayMoves(moves) {
        if (!moves || !Array.isArray(moves) || moves.length === 0) return;
        
        // 初始化新游戏
        this.game.initGame();
        
        // 重放每一步移动
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            
            // 检查是否使用了交换规则
            if (i === 0 && move.swapUsed && move.newPosition) {
                // 先执行第一步移动
                this.game.makeMove(move.position.q, move.position.r, true);
                
                // 然后执行交换规则
                this.game.swapFirstMove();
            } else {
                // 普通移动
                this.game.makeMove(move.position.q, move.position.r, true);
            }
        }
    }
}