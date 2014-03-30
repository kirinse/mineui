define("kirin/utils/1.0.0/helper",[],function(require, exports, module){
  exports.augment = function(receivingClass, obj) {
      for (methodName in obj) {
          if (obj.hasOwnProperty(methodName)) {
              if (!receivingClass.prototype.hasOwnProperty(methodName)) {
                   receivingClass.prototype[methodName] = obj[methodName];
              }
          }
      }
  };
  exports.dblPrototype = function(obj, init) {
      var Middle = function() {};
      Middle.prototype = obj;
      var First = function() {
          if (init) {
              init.apply(this, arguments);
          }
          this[0] = arguments[0];
      };
      First.prototype = new Middle();
      return First;
  };
});