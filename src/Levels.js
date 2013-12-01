var Levels = {
    /**
     * Получить все уровни игры.
     * @returns {Array} Массив уровней. Каждому уровню соответсвует матрица ячеек игры и TODO дописать комментарий когда структура устоиться.
     */
    GetAllLevels : function(){
        var levels = [];

        levels.push({
            Field : [
                [';', ';', '-'],
                ['=', '3', '+'],
                ['+', 'var t = ', '5']
            ],
            Start : [2, 1],
            Finish : [0, 1]
        });

        return levels;
    }
};
