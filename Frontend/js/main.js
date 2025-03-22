/**
 * main.js - Hex游戏的主入口文件
 */

// 全局变量
let hexBoard;
let hexGame;
let hexHistory;
let hexStyle;
let hexSaveLoad;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    initGame();
    
    // 添加事件监听
    addEventListeners();
    
    // 设置游戏状态更新回调
    if (hexGame) {
        hexGame.onGameStateChange = updateGameStatus;
    }
});

/**
 * 初始化游戏
 */
function initGame() {
    // 获取游戏设置
    const boardSize = parseInt(document.getElementById('board-size').value) || 11;
    const gameMode = document.getElementById('game-mode').value || 'human-human';
    const aiDifficulty = document.getElementById('ai-difficulty').value || 'medium';
    const firstPlayer = document.getElementById('first-player').value || 'red';
    
    // 创建棋盘
    hexBoard = new HexBoard('board', {
        size: boardSize,
        redColor: document.getElementById('red-color').value || '#ff4136',
        blueColor: document.getElementById('blue-color').value || '#0074d9',
        boardColor: document.getElementById('board-color').value || '#f5deb3',
        cellSize: parseInt(document.getElementById('cell-size').value) || 35,
        orientation: document.getElementById('board-orientation').value || 'flat'
    });
    
    // 创建游戏
    hexGame = new HexGame(hexBoard, {
        firstPlayer: firstPlayer,
        gameMode: gameMode,
        aiDifficulty: aiDifficulty
    });
    
    // 创建历史记录管理器
    hexHistory = new HexHistory(hexGame);
    
    // 创建样式管理器
    hexStyle = new HexStyle(hexGame);
    
    // 创建保存/加载管理器
    hexSaveLoad = new HexSaveLoad(hexGame);
    
    // 更新游戏状态
    updateGameStatus();
}

/**
 * 添加事件监听
 */
function addEventListeners() {
    // 新游戏按钮
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            initGame();
        });
    }
    
    // 交换按钮
    const swapBtn = document.getElementById('swap-btn');
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            hexGame.swapFirstMove();
        });
    }
    
    // 游戏模式选择
    const gameModeSelect = document.getElementById('game-mode');
    if (gameModeSelect) {
        gameModeSelect.addEventListener('change', () => {
            // 显示/隐藏AI选项
            const aiOptions = document.querySelector('.ai-options');
            if (aiOptions) {
                aiOptions.style.display = gameModeSelect.value === 'human-ai' ? 'flex' : 'none';
            }
        });
        
        // 初始显示/隐藏AI选项
        const aiOptions = document.querySelector('.ai-options');
        if (aiOptions) {
            aiOptions.style.display = gameModeSelect.value === 'human-ai' ? 'flex' : 'none';
        }
    }
    
    // 自定义AI按钮
    const customAiBtn = document.getElementById('custom-ai-btn');
    const customAiModal = document.getElementById('custom-ai-modal');
    const closeBtn = document.querySelector('.close');
    const uploadAiBtn = document.getElementById('upload-ai-btn');
    
    if (customAiBtn && customAiModal) {
        // 打开模态框
        customAiBtn.addEventListener('click', () => {
            customAiModal.style.display = 'block';
        });
        
        // 关闭模态框
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                customAiModal.style.display = 'none';
            });
        }
        
        // 点击模态框外部关闭
        window.addEventListener('click', (event) => {
            if (event.target === customAiModal) {
                customAiModal.style.display = 'none';
            }
        });
        
        // 上传AI文件
        if (uploadAiBtn) {
            uploadAiBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('ai-file-input');
                if (fileInput && fileInput.files.length > 0) {
                    // 获取文件
                    const file = fileInput.files[0];
                    
                    // 创建FormData对象
                    const formData = new FormData();
                    formData.append('ai_file', file);
                    
                    // 发送到后端
                    fetch('/upload_ai', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('AI文件上传成功！');
                            customAiModal.style.display = 'none';
                        } else {
                            alert('AI文件上传失败：' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('上传AI文件出错:', error);
                        alert('上传AI文件出错，请检查控制台获取详细信息。');
                    });
                } else {
                    alert('请选择一个Python文件。');
                }
            });
        }
    }
}

/**
 * 更新游戏状态
 */
function updateGameStatus() {
    // 更新状态消息
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
        if (hexGame.gameOver) {
            statusMessage.textContent = `游戏结束，${hexGame.winner === 'red' ? '红方' : '蓝方'}获胜！`;
        } else {
            statusMessage.textContent = `当前回合：${hexGame.currentPlayer === 'red' ? '红方' : '蓝方'}`;
        }
    }
    
    // 更新交换按钮显示
    const swapBtn = document.getElementById('swap-btn');
    if (swapBtn) {
        swapBtn.style.display = hexGame.swapAvailable ? 'inline-block' : 'none';
    }
    
    // 更新玩家颜色
    const redPlayerColor = document.querySelector('.player.red .player-color');
    const bluePlayerColor = document.querySelector('.player.blue .player-color');
    
    if (redPlayerColor) {
        redPlayerColor.style.backgroundColor = hexBoard.options.redColor;
    }
    
    if (bluePlayerColor) {
        bluePlayerColor.style.backgroundColor = hexBoard.options.blueColor;
    }
}