/**
 * board.js - 负责绘制和管理Hex棋盘
 */

class HexBoard {
    constructor(containerId, options = {}) {
        // 默认选项
        this.options = {
            size: 11,                // 棋盘大小 (n x n)
            cellSize: 35,            // 六边形格子大小
            boardColor: '#f5deb3',   // 棋盘颜色
            redColor: '#ff4136',     // 红方颜色
            blueColor: '#0074d9',    // 蓝方颜色
            orientation: 'flat',     // 六边形朝向: 'flat'(水平) 或 'pointy'(垂直)
            ...options
        };

        // 获取容器元素
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }

        // 创建SVG元素
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.container.appendChild(this.svg);

        // 初始化棋盘数据
        this.cells = [];
        this.boardData = [];
        
        // 初始化棋盘
        this.initBoard();
    }

    /**
     * 初始化棋盘
     */
    initBoard() {
        // 清空现有内容
        this.svg.innerHTML = '';
        this.cells = [];
        this.boardData = [];

        const { size, cellSize, orientation } = this.options;

        // 初始化棋盘数据
        for (let r = 0; r < size; r++) {
            this.boardData[r] = [];
            for (let q = 0; q < size; q++) {
                this.boardData[r][q] = null; // null表示空格子
            }
        }

        // 计算六边形的尺寸
        const hexHeight = orientation === 'flat' 
            ? Math.sqrt(3) * cellSize 
            : 2 * cellSize;
        const hexWidth = orientation === 'flat' 
            ? 2 * cellSize 
            : Math.sqrt(3) * cellSize;

        // 计算棋盘尺寸
        const boardWidth = orientation === 'flat'
            ? (size * 1.5 * cellSize) + (0.5 * cellSize)
            : (size * hexWidth) + (0.5 * hexWidth);
        const boardHeight = orientation === 'flat'
            ? (size * hexHeight) + (0.5 * hexHeight)
            : (size * 1.5 * cellSize) + (0.5 * cellSize);

        // 设置SVG尺寸
        this.svg.setAttribute('width', boardWidth);
        this.svg.setAttribute('height', boardHeight);

        // 添加棋盘背景
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', this.options.boardColor);
        this.svg.appendChild(background);

        // 创建六边形格子
        for (let r = 0; r < size; r++) {
            for (let q = 0; q < size; q++) {
                const cell = this.createHexCell(q, r, cellSize, orientation);
                this.cells.push(cell);
                this.svg.appendChild(cell);
            }
        }

        // 添加边界指示
        this.addBoardBorders();
        
        // 添加坐标标签
        this.addBoardLabels();
    }

    /**
     * 创建六边形格子
     */
    createHexCell(q, r, size, orientation) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('hex-cell');
        group.dataset.q = q;
        group.dataset.r = r;

        // 计算六边形的中心坐标
        let x, y;
        if (orientation === 'flat') {
            // 水平朝向的六边形
            x = size * 1.5 * q;
            y = size * Math.sqrt(3) * (r + (q / 2));
        } else {
            // 垂直朝向的六边形
            x = size * Math.sqrt(3) * (q + (r / 2));
            y = size * 1.5 * r;
        }

        // 创建六边形路径
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = this.calculateHexPoints(x, y, size, orientation);
        polygon.setAttribute('points', points);
        polygon.setAttribute('fill', 'white');
        polygon.setAttribute('stroke', '#333');
        polygon.setAttribute('stroke-width', '1');

        group.appendChild(polygon);
        group.style.transform = `translate(${size}px, ${size}px)`;

        return group;
    }

    /**
     * 计算六边形的顶点坐标
     */
    calculateHexPoints(x, y, size, orientation) {
        const points = [];
        const angleOffset = orientation === 'flat' ? 0 : 30;

        for (let i = 0; i < 6; i++) {
            const angle = (60 * i + angleOffset) * Math.PI / 180;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            points.push(`${px},${py}`);
        }

        return points.join(' ');
    }

    /**
     * 添加棋盘边界指示
     */
    addBoardBorders() {
        const { size, redColor, blueColor, orientation } = this.options;
        const cellSize = this.options.cellSize;

        // 创建边界指示器
        const createBorder = (color, points) => {
            const border = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            border.setAttribute('points', points.join(' '));
            border.setAttribute('stroke', color);
            border.setAttribute('stroke-width', '4');
            border.setAttribute('fill', 'none');
            this.svg.appendChild(border);
        };

        // 获取格子的中心坐标
        const getCellCenter = (q, r) => {
            let x, y;
            if (orientation === 'flat') {
                x = cellSize * 1.5 * q + cellSize;
                y = cellSize * Math.sqrt(3) * (r + (q / 2)) + cellSize;
            } else {
                x = cellSize * Math.sqrt(3) * (q + (r / 2)) + cellSize;
                y = cellSize * 1.5 * r + cellSize;
            }
            return { x, y };
        };

        // 获取格子的边缘点
        const getCellEdgePoints = (q, r) => {
            const center = getCellCenter(q, r);
            const points = [];
            const angleOffset = orientation === 'flat' ? 0 : 30;

            for (let i = 0; i < 6; i++) {
                const angle = (60 * i + angleOffset) * Math.PI / 180;
                const px = center.x + cellSize * Math.cos(angle);
                const py = center.y + cellSize * Math.sin(angle);
                points.push({ x: px, y: py });
            }

            return points;
        };

        // 添加红方边界 (左右)
        if (orientation === 'flat') {
            // 水平朝向 - 左边界
            const leftPoints = [];
            for (let r = 0; r < size; r++) {
                const edgePoints = getCellEdgePoints(0, r);
                leftPoints.push(`${edgePoints[4].x},${edgePoints[4].y}`);
                leftPoints.push(`${edgePoints[5].x},${edgePoints[5].y}`);
            }
            createBorder(redColor, leftPoints);

            // 水平朝向 - 右边界
            const rightPoints = [];
            for (let r = 0; r < size; r++) {
                const edgePoints = getCellEdgePoints(size - 1, r);
                rightPoints.push(`${edgePoints[1].x},${edgePoints[1].y}`);
                rightPoints.push(`${edgePoints[2].x},${edgePoints[2].y}`);
            }
            createBorder(redColor, rightPoints);
        } else {
            // 垂直朝向 - 上边界
            const topPoints = [];
            for (let q = 0; q < size; q++) {
                const edgePoints = getCellEdgePoints(q, 0);
                topPoints.push(`${edgePoints[5].x},${edgePoints[5].y}`);
                topPoints.push(`${edgePoints[0].x},${edgePoints[0].y}`);
            }
            createBorder(redColor, topPoints);

            // 垂直朝向 - 下边界
            const bottomPoints = [];
            for (let q = 0; q < size; q++) {
                const edgePoints = getCellEdgePoints(q, size - 1);
                bottomPoints.push(`${edgePoints[2].x},${edgePoints[2].y}`);
                bottomPoints.push(`${edgePoints[3].x},${edgePoints[3].y}`);
            }
            createBorder(redColor, bottomPoints);
        }

        // 添加蓝方边界 (上下)
        if (orientation === 'flat') {
            // 水平朝向 - 上边界
            const topPoints = [];
            for (let q = 0; q < size; q++) {
                const edgePoints = getCellEdgePoints(q, 0);
                topPoints.push(`${edgePoints[0].x},${edgePoints[0].y}`);
                topPoints.push(`${edgePoints[5].x},${edgePoints[5].y}`);
            }
            createBorder(blueColor, topPoints);

            // 水平朝向 - 下边界
            const bottomPoints = [];
            for (let q = 0; q < size; q++) {
                const edgePoints = getCellEdgePoints(q, size - 1);
                bottomPoints.push(`${edgePoints[2].x},${edgePoints[2].y}`);
                bottomPoints.push(`${edgePoints[3].x},${edgePoints[3].y}`);
            }
            createBorder(blueColor, bottomPoints);
        } else {
            // 垂直朝向 - 左边界
            const leftPoints = [];
            for (let r = 0; r < size; r++) {
                const edgePoints = getCellEdgePoints(0, r);
                leftPoints.push(`${edgePoints[4].x},${edgePoints[4].y}`);
                leftPoints.push(`${edgePoints[3].x},${edgePoints[3].y}`);
            }
            createBorder(blueColor, leftPoints);

            // 垂直朝向 - 右边界
            const rightPoints = [];
            for (let r = 0; r < size; r++) {
                const edgePoints = getCellEdgePoints(size - 1, r);
                rightPoints.push(`${edgePoints[0].x},${edgePoints[0].y}`);
                rightPoints.push(`${edgePoints[1].x},${edgePoints[1].y}`);
            }
            createBorder(blueColor, rightPoints);
        }
    }

    /**
     * 添加棋盘坐标标签
     */
    addBoardLabels() {
        const { size, orientation } = this.options;
        const cellSize = this.options.cellSize;

        // 获取标签容器
        const columnLabels = document.querySelector('.column-labels');
        const rowLabels = document.querySelector('.row-labels');
        
        if (!columnLabels || !rowLabels) return;
        
        // 清空现有标签
        columnLabels.innerHTML = '';
        rowLabels.innerHTML = '';

        // 设置标签样式
        const labelStyle = 'position: absolute; font-size: 12px; color: #555;';

        // 添加列标签 (a, b, c, ...)
        for (let q = 0; q < size; q++) {
            const label = document.createElement('div');
            label.textContent = String.fromCharCode(97 + q); // a, b, c, ...
            label.style = labelStyle;

            let x, y;
            if (orientation === 'flat') {
                // 水平朝向的六边形
                x = cellSize * 1.5 * q + cellSize;
                y = 0; // 顶部
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;

                // 底部标签
                const bottomLabel = label.cloneNode(true);
                bottomLabel.style.top = `${this.svg.clientHeight - 15}px`;
                columnLabels.appendChild(bottomLabel);
            } else {
                // 垂直朝向的六边形
                x = cellSize * Math.sqrt(3) * (q + 0.5) + cellSize;
                y = 0; // 顶部
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;

                // 底部标签
                const bottomLabel = label.cloneNode(true);
                bottomLabel.style.top = `${this.svg.clientHeight - 15}px`;
                columnLabels.appendChild(bottomLabel);
            }

            columnLabels.appendChild(label);
        }

        // 添加行标签 (1, 2, 3, ...)
        for (let r = 0; r < size; r++) {
            const label = document.createElement('div');
            label.textContent = (r + 1).toString(); // 1, 2, 3, ...
            label.style = labelStyle;

            let x, y;
            if (orientation === 'flat') {
                // 水平朝向的六边形
                x = 0; // 左侧
                y = cellSize * Math.sqrt(3) * (r + 0.5) + cellSize;
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;

                // 右侧标签
                const rightLabel = label.cloneNode(true);
                rightLabel.style.left = `${this.svg.clientWidth - 15}px`;
                rowLabels.appendChild(rightLabel);
            } else {
                // 垂直朝向的六边形
                x = 0; // 左侧
                y = cellSize * 1.5 * r + cellSize;
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;

                // 右侧标签
                const rightLabel = label.cloneNode(true);
                rightLabel.style.left = `${this.svg.clientWidth - 15}px`;
                rowLabels.appendChild(rightLabel);
            }

            rowLabels.appendChild(label);
        }
    }