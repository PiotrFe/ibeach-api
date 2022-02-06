const Interface = function (name, methodNameArr, propertyNameArr) {
  this.name = name;
  this.methodNames = [];
  this.propertyNames = [];

  for (let methodName of methodNameArr) {
    if (typeof methodName !== "string") {
      throw new Error("Method names are expected to be a string");
    }
    this.methodNames.push(methodName);
  }
  for (let propertyName of propertyNameArr) {
    if (typeof propertyName !== "string") {
      throw new Error("Property names are expected to be a string");
    }

    this.propertyNames.push(propertyName);
  }
};

Interface.prototype.isImplementedBy = function (obj) {
  if (obj) {
    for (let methodName of this.methodNames) {
      if (!obj[methodName] || typeof obj[methodName] !== "function") {
        throw new Error(
          `The object does not implement interface ${this.name}. Method ${methodName} not found.`
        );
      }
    }

    for (let propertyName of this.propertyNames) {
      if (!obj[propertyName] || typeof obj[propertyName] === "function") {
        throw new Error(
          `The object does not implement interface ${this.name}. Property ${methodName} not found.`
        );
      }
    }
  } else {
    throw new Error("No object to check");
  }
};

module.exports.Interface = Interface;
