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

        this.currentLevel.StartCell = this.currentLevel.Field[this.levels[levelNumber].Start[0]][this.levels[levelNumber].Start[1]];
        this.currentLevel.FinishCell = this.currentLevel.Field[this.levels[levelNumber].Finish[0]][this.levels[levelNumber].Finish[1]];

        this.currentLevel.FinishCell.Td.addClass('GoalCell');
        this.currentLevel.FinishCell.Td.text(this.currentLevel.FinishCell.Text);

        this.openCell(this.currentLevel.StartCell);
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
    selectCell : function(cell){
        if (this.currentLevel.SelectedCell == cell || !cell.HasOpened) {
            return;
        }

        this.addCell(cell);

        if (this.currentLevel.FinishCell == cell) {
            CodeRunner.Run(this.codeField.val());
            return;
        }

        cell.Td.text(cell.Text);
        cell.Td.removeClass('OpenedCell');
        cell.Td.addClass('CurrentCell');

        if (cell.Row > 0) {
            this.openCell(this.currentLevel.Field[cell.Row - 1][cell.Col]);
        }

        if (cell.Col > 0) {
            this.openCell(this.currentLevel.Field[cell.Row][cell.Col - 1]);
        }

        if (cell.Row < this.currentLevel.Rows - 1) {
            this.openCell(this.currentLevel.Field[cell.Row + 1][cell.Col]);
        }

        if (cell.Col < this.currentLevel.Cols - 1) {
            this.openCell(this.currentLevel.Field[cell.Row][cell.Col + 1]);
        }

        this.currentLevel.SelectedCell = cell;
    },

    /**
     * Добавить ячейку в стек выбранных.
     * При этом тескт ячейки попадет в основной код.
     * @param {object} cell Ячейка, которую необходимо добавить в стек выбранных.
     */
    addCell : function(cell) {
        if (cell.HasAdded) {
            return;
        }

        cell.HasAdded = true;
        this.codeField.val(this.codeField.val() + cell.Text);
    },

    /**
     * Открыть ячейку. Показать игроку текст ячейки.
     * @param {object} cell Ячейка, которую необходимо открыть.
     */
    openCell : function(cell) {
        if (cell.HasOpened) {
            return;
        }

        cell.HasOpened = true;
        cell.Td.text(cell.Text);
        cell.Td.addClass('OpenedCell');
    }
};