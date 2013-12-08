/**
 * Основной объект игры.
 */
var Game = {
    /**
     * Текущий уровен игры.
     */
    currentLevel : undefined,

    /**
     * Все уровни игры.
     */
    levels : undefined,

    /**
     * Поле игры на которое будет загружен очередной уровень.
     */
    gameField : undefined,

    /**
     * Input в который будет записан результирующий код.
     */
    codeField : undefined,

    /**
     * Стек выбранных ячеек.
     */
    stackSelectedCells : [],

    /**
     * Инициализировать игру.
     */
    Init : function(gameFieldId, codeFieldId) {
        this.levels = Levels.GetAllLevels();
        this.gameField = $('#' + gameFieldId);
        this.codeField = $('#' + codeFieldId);

        this.goToLevel(0);
    },

    /**
     * Очистить игрое поле от предыдущего уровня.
     */
    clear : function() {
        this.gameField.find('table').remove();
        this.codeField.val('');
    },

    /**
     * Загрузить уровень с указанным номером.
     * @param {int} levelNumber Номер уровня, который необходимо загрузить.
     */
    goToLevel : function(levelNumber) {
        this.clear();

        this.currentLevel = {};
        this.currentLevel.Field = [];
        this.currentLevel.SelectedCell = undefined;
        this.currentLevel.Rows = this.levels[levelNumber].Field.length;
        this.currentLevel.Cols = this.levels[levelNumber].Field[0].length;

        var table = $('<table>').appendTo(this.gameField);
        var field = this.levels[levelNumber].Field;

        for (var i = 0; i < field.length; i++) {
            this.currentLevel.Field.push([]);
            var tr = $('<tr>').appendTo(table);

            for (var j = 0; j < field[i].length; j++) {
                var td = $('<td>').appendTo(tr);
                var currentCell = this.currentLevel.Field[i][j] = {
                    Text : field[i][j],
                    Td : td,
                    HasOpened : false,
                    HasAdded : false,
                    Row : i,
                    Col : j
                };

                this.addCellClickEvent(currentCell);
                this.currentLevel.Field[i].push(currentCell);
            }
        }

        for (i = 0; i < this.currentLevel.Rows; i++) {
            for (j = 0; j < this.currentLevel.Cols; j++) {
                currentCell = this.currentLevel.Field[i][j];

                if (i > 0) {
                    currentCell.TopCell = this.currentLevel.Field[i - 1][j];
                }

                if (j > 0) {
                    currentCell.LeftCell = this.currentLevel.Field[i][j - 1];
                }

                if (i < this.currentLevel.Rows - 1) {
                    currentCell.BottomCell = this.currentLevel.Field[i + 1][j];
                }

                if (j < this.currentLevel.Cols - 1) {
                    currentCell.RightCell = this.currentLevel.Field[i][j + 1];
                }
            }
        }

        this.currentLevel.StartCell = this.currentLevel.Field[this.levels[levelNumber].Start[0]][this.levels[levelNumber].Start[1]];
        this.currentLevel.FinishCell = this.currentLevel.Field[this.levels[levelNumber].Finish[0]][this.levels[levelNumber].Finish[1]];

        this.currentLevel.FinishCell.Td.addClass('GoalCell');
        this.currentLevel.FinishCell.Td.text(this.currentLevel.FinishCell.Text);

        this.openCell(this.currentLevel.StartCell);
    },

    /**
     * Отменить выбор последней ячейки.
     */
    undo : function() {
        if (this.stackSelectedCells.length > 1) {
            var cell = this.stackSelectedCells[this.stackSelectedCells.length - 1];

            this.removeCellFromStack(cell);

            if (cell.LinkCells) {
                for (var i = 0; i < cell.LinkCells.length; i++) {
                    this.closeCell(cell.LinkCells[i]);
                }
            }

            cell.Td.removeClass('CurrentCell');
            this.currentLevel.SelectedCell = this.stackSelectedCells[this.stackSelectedCells.length - 2];
        }
    },

    /**
     * Метод для иниицализации события клика по ячейке.
     * Вынесено в отдельный метод для работы с замыканием.
     * @param {object} cell Ячейка, которой необходимо инициализировать событие клика.
     */
    addCellClickEvent : function(cell) {
        var $this = this;
        cell.Td.click(function() {
            $this.selectCell(cell);
        });
    },

    /**
     * Выделить ячейку.
     * Выделенная ячейка определяет текущую позицию на поле.
     * Текущая позиция показывает, какая ячейка была открыта последней.
     * @param {object} cell Ячейка, которую необходимо выделить.
     */
    selectCell : function(cell) {
        if (this.currentLevel.SelectedCell == cell || !cell.HasOpened) {
            return;
        }

        this.addCellToStack(cell);

        if (this.currentLevel.FinishCell == cell) {
            CodeRunner.Run(this.codeField.val());
            return;
        }

        cell.Td.text(cell.Text);
        cell.Td.removeClass('OpenedCell');
        cell.Td.addClass('CurrentCell');
        cell.LinkCells = [];

        if (cell.TopCell) {
            var openedCell = this.openCell(cell.TopCell);

            if (openedCell) {
                cell.LinkCells.push(openedCell);
            }
        }

        if (cell.LeftCell) {
            var openedCell = this.openCell(cell.LeftCell);

            if (openedCell) {
                cell.LinkCells.push(openedCell);
            }
        }

        if (cell.BottomCell) {
            var openedCell = this.openCell(cell.BottomCell);

            if (openedCell) {
                cell.LinkCells.push(openedCell);
            }
        }

        if (cell.RightCell) {
            var openedCell = this.openCell(cell.RightCell);

            if (openedCell) {
                cell.LinkCells.push(openedCell);
            }
        }

        this.currentLevel.SelectedCell = cell;
    },

    /**
     * Добавить ячейку в стек выбранных.
     * При этом тескт ячейки попадет в основной код.
     * @param {object} cell Ячейка, которую необходимо добавить в стек выбранных.
     */
    addCellToStack : function(cell) {
        if (cell.HasAdded) {
            return;
        }

        cell.HasAdded = true;
        this.stackSelectedCells.push(cell);
        this.codeField.val(this.codeField.val() + cell.Text);
    },

    /**
     * Удалить ячейку из стека выбранных.
     * @param {object} cell Ячейка, которую необходимо удалить.
     */
    removeCellFromStack : function(cell) {
        var index = this.stackSelectedCells.indexOf(cell);

        if(index > 0) {
            cell.HasAdded = false;

            // Удалим из стека.
            this.stackSelectedCells.splice(index, 1);

            // Удалим часть кода.
            var code = this.codeField.val();
            code = code.substring(0, code.length - cell.Text.length);
            this.codeField.val(code);
        }
    },

    /**
     * Открыть ячейку. Показать игроку текст ячейки.
     * @param {object} cell Ячейка, которую необходимо открыть.
     * @return {object} Возвращает саму ячейку в случае, если она была открыта.
     */
    openCell : function(cell) {
        if (cell.HasOpened) {
            return null;
        }

        cell.HasOpened = true;
        cell.Td.text(cell.Text);
        cell.Td.addClass('OpenedCell');

        return cell;
    },

    /**
     * Закрыть ячейку. Скрыть текст ячейки от игрока.
     * @param {object} cell Ячейка, которую необходимо скрыть.
     * @return {object} Возвращает саму ячейку в случае, если она была закрыта.
     */
    closeCell : function(cell) {
        if (!cell.HasOpened || cell === this.currentLevel.StartCell) {
            return null;
        }

        cell.HasOpened = false;
        cell.Td.text('');
        cell.Td.removeClass('OpenedCell');

        return cell;
    }
};