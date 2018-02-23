(function () {
    var firPosX = 0,  //界定初始位置X,Y
        firPosY = 0,
        index = -1, //初始化圆圈序列号
        move = false, //移动许可
        inArea = true,
        curIndex  = 0; //当前选中圆圈序列号

//    添加圆圈及给添加的圆圈绑定点击、移动等时间
    $('.content').on('mouseup',function (event) {
        var event = event || window.event;
        firPosX = event.clientX;
        firPosY = event.clientY;
        var object = `<div class="myCanvas" style="position:absolute;top:${firPosY-25}px;left:${firPosX-25}px;width: 50px;height: 50px;border-radius: 25px;border: 1px solid #fff;"></div>`;
        $(this).append(object);

        $('.myCanvas').on('click',function (e) {
            e.stopPropagation();
            curIndex = $(this).index();
            $('.myCanvas').css({
                border: '1px solid #fff'
            });
            $(this).css({
                border: '1px solid #cc2d09'
            });
        });

        $('.myCanvas').on('mousedown',function (e) {
            e.stopPropagation();
            move = true;
        });
        $('.myCanvas').on('mouseup',function (e) {
            e.stopPropagation();
            move = false;
        });
        $('.content').on('mouseleave',function () {inArea = false;});
        $('.content').on('mouseenter',function () {inArea = true;});
        $('.content').on('mousemove',function (event) {
            event.stopPropagation();
            if ( move && inArea){
                var event = event || window.event;
                var
                    left = event.clientX,
                    top = event.clientY;

                var obj = $('.myCanvas').eq(curIndex),
                    r = parseFloat(obj.css('width')),
                    mainWidth = parseFloat($('.content').css('width')),
                    mainHeight = parseFloat($('.content').css('height'));
                var moveTop = top - r / 2,
                    moveLeft = left - r / 2;
                if (moveTop >= mainHeight - r) {
                    moveTop = mainHeight - r;
                }
                if (moveLeft >= mainWidth - r) {
                    moveLeft = mainWidth - r;
                }
                if(moveTop <= 0){
                    moveTop = 0;
                }
                if(moveLeft <= 0){
                    moveLeft = 0;
                }
                obj.css({
                    top: moveTop + 'px',
                    left: moveLeft + 'px'
                });
            }
        });
        index++;
        curIndex = index;
        $('.myCanvas').css({border:'1px solid #fff'});
        $('.myCanvas').eq(curIndex).css({border:'1px solid #cc2d09'});
    });

//    监听删除按键
    $(document).on('keydown',function (event) {
        var event = event || window.event;
        if(index !== -1){
            var keycode = event.keyCode;
            if(keycode === 46){
                $('.myCanvas').eq(curIndex).remove();
                index--;
                curIndex = index;
                $('.myCanvas').eq(curIndex).css({
                    border:'1px solid #cc2d09'
                })
            }
        }
    });

    $(window).on('mousewheel DOMMouseScroll', (event) => {
        event.stopPropagation();
    var delta = event.originalEvent.detail || -event.originalEvent.wheelDelta;
    if(index !== -1){
        var obj  = $('.myCanvas').eq(curIndex);
        var r = parseFloat(obj.css('width'));
        var top  = parseFloat(obj.css('top'));
        var left = parseFloat(obj.css('left'));
        var oldR = r;
        if(delta > 0){
            setTimeout(function () {
                r-=2;
                if(r <= 2){
                    $('.myCanvas').eq(curIndex).remove();
                    index--;
                }
                obj.css({
                    width:r +  'px',
                    height:r + 'px',
                    top:top - (r-oldR)/2+'px',
                    left:left - (r-oldR)/2 +'px',
                    borderRadius:r/2+'px'
                });
            },10);
        }else {
            setTimeout(function () {
                r+=2;
                obj.css({
                    width:r +  'px',
                    height:r + 'px',
                    top:top - (r-oldR)/2+'px',
                    left:left - (r-oldR)/2 +'px',
                    borderRadius:r/2+'px'
                });
            },10);
        }
    }
})

    $('#downLoad').on('click',function () {
        html2canvas($('.content')).then(function (canvas) {
            let imgUri = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // 获取生成的图片的url
            let img = `<img src="${canvas.toDataURL("ikikmage/png")}" style="height:200px;position: absolute;right:0;top:0;border:1px solid #fff"/>`;
            $('.content').append(img);
            saveFile(imgUri,'download.png');
        })
    });

    // 保存文件函数
    var saveFile = function(data, filename){
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = data;
        save_link.download = filename;

        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    };
})();