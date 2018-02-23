// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      function localRequire(x) {
        return newRequire(localRequire.resolve(x));
      }

      localRequire.resolve = function (x) {
        return modules[name][1][x] || x;
      };

      var module = cache[name] = new newRequire.Module;
      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({11:[function(require,module,exports) {
var Canvas2Image = (function() {
    // check if we have canvas support
    var oCanvas = document.createElement("canvas");

    // no canvas, bail out.
    if (!oCanvas.getContext) {
        return {
            saveAsBMP : function(){},
            saveAsPNG : function(){},
            saveAsJPEG : function(){}
        }
    }

    var bHasImageData = !!(oCanvas.getContext("2d").getImageData);
    var bHasDataURL = !!(oCanvas.toDataURL);
    var bHasBase64 = !!(window.btoa);

    var strDownloadMime = "image/octet-stream";

    // ok, we're good
    var readCanvasData = function(oCanvas) {
        var iWidth = parseInt(oCanvas.width);
        var iHeight = parseInt(oCanvas.height);
        return oCanvas.getContext("2d").getImageData(0,0,iWidth,iHeight);
    }

    // base64 encodes either a string or an array of charcodes
    var encodeData = function(data) {
        var strData = "";
        if (typeof data == "string") {
            strData = data;
        } else {
            var aData = data;
            for (var i = 0; i < aData.length; i++) {
                strData += String.fromCharCode(aData[i]);
            }
        }
        return btoa(strData);
    }

    // creates a base64 encoded string containing BMP data
    // takes an imagedata object as argument
    var createBMP = function(oData) {
        var aHeader = [];

        var iWidth = oData.width;
        var iHeight = oData.height;

        aHeader.push(0x42); // magic 1
        aHeader.push(0x4D);

        var iFileSize = iWidth*iHeight*3 + 54; // total header size = 54 bytes
        aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
        aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
        aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
        aHeader.push(iFileSize % 256);

        aHeader.push(0); // reserved
        aHeader.push(0);
        aHeader.push(0); // reserved
        aHeader.push(0);

        aHeader.push(54); // data offset
        aHeader.push(0);
        aHeader.push(0);
        aHeader.push(0);

        var aInfoHeader = [];
        aInfoHeader.push(40); // info header size
        aInfoHeader.push(0);
        aInfoHeader.push(0);
        aInfoHeader.push(0);

        var iImageWidth = iWidth;
        aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
        aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
        aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
        aInfoHeader.push(iImageWidth % 256);

        var iImageHeight = iHeight;
        aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
        aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
        aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
        aInfoHeader.push(iImageHeight % 256);

        aInfoHeader.push(1); // num of planes
        aInfoHeader.push(0);

        aInfoHeader.push(24); // num of bits per pixel
        aInfoHeader.push(0);

        aInfoHeader.push(0); // compression = none
        aInfoHeader.push(0);
        aInfoHeader.push(0);
        aInfoHeader.push(0);

        var iDataSize = iWidth*iHeight*3;
        aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
        aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
        aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
        aInfoHeader.push(iDataSize % 256);

        for (var i = 0; i < 16; i++) {
            aInfoHeader.push(0);	// these bytes not used
        }

        var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

        var aImgData = oData.data;

        var strPixelData = "";
        var y = iHeight;
        do {
            var iOffsetY = iWidth*(y-1)*4;
            var strPixelRow = "";
            for (var x=0;x<iWidth;x++) {
                var iOffsetX = 4*x;

                strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+2]);
                strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+1]);
                strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX]);
            }
            for (var c=0;c<iPadding;c++) {
                strPixelRow += String.fromCharCode(0);
            }
            strPixelData += strPixelRow;
        } while (--y);

        return encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);
    }

    // sends the generated file to the client
    var saveFile = function(strData) {
        if (!window.open(strData)) {
            document.location.href = strData;
        }
    }

    var makeDataURI = function(strData, strMime) {
        return "data:" + strMime + ";base64," + strData;
    }

    // generates a <img> object containing the imagedata
    var makeImageObject = function(strSource) {
        var oImgElement = document.createElement("img");
        oImgElement.src = strSource;
        return oImgElement;
    }

    var scaleCanvas = function(oCanvas, iWidth, iHeight) {
        if (iWidth && iHeight) {
            var oSaveCanvas = document.createElement("canvas");

            oSaveCanvas.width = iWidth;
            oSaveCanvas.height = iHeight;
            oSaveCanvas.style.width = iWidth+"px";
            oSaveCanvas.style.height = iHeight+"px";

            var oSaveCtx = oSaveCanvas.getContext("2d");

            oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iWidth);

            return oSaveCanvas;
        }
        return oCanvas;
    }

    return {
        saveAsPNG : function(oCanvas, bReturnImg, iWidth, iHeight) {
            if (!bHasDataURL) {
                return false;
            }
            var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
            var strData = oScaledCanvas.toDataURL("image/png");
            if (bReturnImg) {
                return makeImageObject(strData);
            } else {
                saveFile(strData.replace("image/png", strDownloadMime));
            }
            return true;
        },

        saveAsJPEG : function(oCanvas, bReturnImg, iWidth, iHeight) {
            if (!bHasDataURL) {
                return false;
            }

            var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
            var strMime = "image/jpeg";
            var strData = oScaledCanvas.toDataURL(strMime);

            // check if browser actually supports jpeg by looking for the mime type in the data uri.
            // if not, return false
            if (strData.indexOf(strMime) != 5) {
                return false;
            }

            if (bReturnImg) {
                return makeImageObject(strData);
            } else {
                saveFile(strData.replace(strMime, strDownloadMime));
            }
            return true;
        },

        saveAsBMP : function(oCanvas, bReturnImg, iWidth, iHeight) {
            if (!(bHasImageData && bHasBase64)) {
                return false;
            }

            var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);

            var oData = readCanvasData(oScaledCanvas);
            var strImgData = createBMP(oData);
            if (bReturnImg) {
                return makeImageObject(makeDataURI(strImgData, "image/bmp"));
            } else {
                saveFile(makeDataURI(strImgData, strDownloadMime));
            }
            return true;
        }
    };

})();
},{}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent) {
  var ws = new WebSocket('ws://localhost:58398/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = () => {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,11])