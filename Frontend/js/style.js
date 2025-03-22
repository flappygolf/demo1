/**
 * style.js - 负责Hex游戏的样式控制
 */

class HexStyle {
    constructor(game) {
        this.game = game;
        this.board = game.board;
        
        // 获取样式控制元素
        this.redColorInput = document.getElementById('red-color');
        this.blueColorInput = document.getElementById('blue-color');
        this.boardColorInput = document.getElementById('board-color');
        this.cellSizeInput = document.getElementById('cell-size');
        this.boardOrientationSelect = document.getElementById('board-orientation');
        
        // 初始化事件监听
        this.initEventListeners();
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 红方颜色
        if (this.redColorInput) {
            this.redColorInput.addEventListener('input', () => {
                this.updateRedColor(this.redColorInput.value);
            });
        }
        
        // 蓝方颜色
        if (this.blueColorInput) {
            this.blueColorInput.addEventListener('input', () => {
                this.updateBlueColor(this.blueColorInput.value);
            });
        }
        
        // 棋盘颜色
        if (this.boardColorInput) {
            this.boardColorInput.addEventListener('input', () => {
                this.updateBoardColor(this.boardColorInput.value);
            });
        }
        
        // 格子大小
        if (this.cellSizeInput) {
            this.cellSizeInput.addEventListener('input', () => {
                this.updateCellSize(parseInt(this.cellSizeInput.value));
            });
        }
        
        // 棋盘朝向
        if (this.boardOrientationSelect) {
            this.boardOrientationSelect.addEventListener('change', () => {
                this.updateBoardOrientation(this.boardOrientationSelect.value);
            });
        }
    }

    /**
     * 更新红方颜色
     */
    updateRedColor(color) {
        // 更新棋盘选项
        this.board.options.redColor = color;
        
        // 更新棋盘边界颜色
        const redBorders = document.querySelectorAll('polyline[stroke="' + this.board.options.redColor + '"]');
        redBorders.forEach(border => {
            border.setAttribute('stroke', color);
        });
        
        // 更新红方棋子颜色
        const redCells = document.querySelectorAll('.hex-cell.red polygon');
        redCells.forEach(cell => {
            cell.setAttribute('fill', color);
        });
        
        // 更新玩家信息区域的颜色
        const redPlayerColor = document.querySelector('.player.red .player-color');
        if (redPlayerColor) {
            redPlayerColor.style.backgroundColor = color;
        }
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--red-color', color);
    }

    /**
     * 更新蓝方颜色
     */
    updateBlueColor(color) {
        // 更新棋盘选项
        this.board.options.blueColor = color;
        
        // 更新棋盘边界颜色
        const blueBorders = document.querySelectorAll('polyline[stroke="' + this.board.options.blueColor + '"]');
        blueBorders.forEach(border => {
            border.setAttribute('stroke', color);
        });
        
        // 更新蓝方棋子颜色
        const blueCells = document.querySelectorAll('.hex-cell.blue polygon');
        blueCells.forEach(cell => {
            cell.setAttribute('fill', color);
        });
        
        // 更新玩家信息区域的颜色
        const bluePlayerColor = document.querySelector('.player.blue .player-color');
        if (bluePlayerColor) {
            bluePlayerColor.style.backgroundColor = color;
        }
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--blue-color', color);
    }

    /**
     * 更新棋盘颜色
     */
    updateBoardColor(color) {
        // 更新棋盘选项
        this.board.options.boardColor = color;
        
        // 更新棋盘背景颜色
        const background = this.board.svg.querySelector('rect');
        if (background) {
            background.setAttribute('fill', color);
        }
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--board-color', color);
    }

    /**
     * 更新格子大小
     */
    updateCellSize(size) {
        // 更新棋盘选项
        this.board.options.cellSize = size;
        
        // 重新初始化棋盘
        this.board.initBoard();
        
        // 重新添加事件监听
        this.game.addBoardEventListeners();
    }

    /**
     * 更新棋盘朝向
     */
    updateBoardOrientation(orientation) {
        // 更新棋盘选项
        this.board.options.orientation = orientation;
        
        // 重新初始化棋盘
        this.board.initBoard();
        
        // 重新添加事件监听
        this.game.addBoardEventListeners();
    }
}