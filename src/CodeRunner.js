/**
 * Объект содержащий методы для работы с кодом.
 */
var CodeRunner = {
    /**
     * Запустить код на выполнение.
     * @param {string} code Код, который необходимо выполнить.
     */
  Run : function(code) {
      try {
          var result = eval(code);

          alert('Win');
      }
      catch(e) {
          if (e) {
              alert('Fail');
          }
      }
  }
};
