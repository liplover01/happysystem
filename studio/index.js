var Toast
var script_url = 'https://script.google.com/macros/s/AKfycbw8_xSBMsD_auWTLk6e2KmrjWw4POYdBljhmZESCBWpzUlEr6hy6FfJjww-xVbyyYNV4Q/exec'
var click = 0
var click_time
var profile
var isAdmin = false
var model_list = {}
function adminClick() {
    if (!click_time) click_time = new Date().getTime()
    if (new Date().getTime() - click_time > 5000) {
        click = 0
        click_time = new Date().getTime()
    }
    click++
    console.log("🚀 ~ click:", click)
    if (click == 9) {
        Swal.fire({
            icon: 'question',
            title: 'Password',
            input: 'password',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: false,
            confirmButtonText: 'ยืนยัน',
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
            preConfirm: (password) => {
                return $.ajax({
                    url: script_url,
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        opt: 'register',
                        password: password,
                        uid: profile.userId,
                        name: profile.displayName,
                    },
                    success: (res) => {
                        if (res.status == 'success') {
                            localStorage.setItem('system_happy_login_status', profile.userId)
                            Swal.fire({
                                icon: 'success',
                                title: 'ยืนยันสำเร็จ',
                                text: 'คุณได้รับสิทธิ์เข้าใช้งานแล้ว',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                localStorage.setItem('system_happy_login_status', liff.getDecodedIDToken().sub)
                                location.reload()
                            })
                        } else {
                            Swal.showValidationMessage(
                                `รหัสผ่านไม่ถูกต้อง`
                            )
                        }
                    },
                    error: (err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'กรุณาลองใหม่อีกครั้ง',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            location.reload()
                        })
                    }
                })
            },
        })
    }
}
$(document).ready(function () {
    $('.search').mask('LIP-000000');

    liff.init({
        liffId: '1660662622-RYp33E0P',
        withLoginOnExternalBrowser: true
    })
   


    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'get_model_list'
        },
        success: (res) => {
            console.log("🚀 ~ res:", res)
            model_list = res.list
        },
    })
    $('#pickup-input input').attr('disabled', true)
    Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    liff.ready.then(async () => {
        profile = await liff.getProfile()
        $('#line-profile').attr('src', profile.pictureUrl)
        let system_happy_login_status = localStorage.getItem('system_happy_login_status')
        console.log("🚀 ~ system_happy_login_status:", system_happy_login_status)
        if (system_happy_login_status != null && system_happy_login_status == profile.userId) {
            isAdmin = true
            $('#admin-status').show()
            $('.admin-only').show()
            $('#splash-screen').fadeOut(150, function () {
                $(this).remove();
                // $('body').addClass('menu-color')
                $('#menu-sec').show()
                $('#home-sec').fadeIn(150)
            });
        } else if (system_happy_login_status != null && system_happy_login_status == 'unregisted'){
            $('.admin-only').remove()
            $('#splash-screen').fadeOut(150, function () {
                $(this).remove();
                // $('body').addClass('menu-color')
                $('#menu-sec').show()
                $('#home-sec').fadeIn(150)
            });
        }
        else {
            $.ajax({
                url: script_url,
                method: 'POST',
                dataType: 'json',
                data: {
                    opt: 'check_user',
                    uid: profile.userId
                },
                success: function (res) {
                    console.log(res)
                    if (res.status == 'registed') {
                        localStorage.setItem('system_happy_login_status', profile.userId)
                        isAdmin = true
                        $('#admin-status').show()
                        $('.admin-only').show()
                    }else{
                        localStorage.setItem('system_happy_login_status','unregisted')
                        $('.admin-only').remove()
                    }
                    $('#splash-screen').fadeOut(150, function () {
                        $(this).remove();
                        // $('body').addClass('menu-color')
                        $('#menu-sec').show()
                        $('#home-sec').fadeIn(150)
                    });
                },
                error: function (err) {
                    Toast.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด'
                    })
                }
            })
        }
    })
    $('.menu-btn').click(function () {
        let id = $(this).attr('id').replace('-btn', '').replace('menu-', '')
        $('.hide-on-open').hide()
        $('#menu-sec').fadeOut(150, function () {
            $(this).hide();
            $('#schedule-' + id + '-sec').fadeIn(150, function () {
                $('#back-btn').fadeIn(150)
            })
            $.LoadingOverlay('show')
            let fadein_id = 'schedule-' + id + '-sec'
            switch (fadein_id) {
                case 'schedule-vdo-sec':
                    videoSetCalendar()
                    break;
                case 'schedule-photo-sec':
                    photoSetCalendar()
                    break;
                case 'schedule-onair-sec':
                    onairSetCalendar()
                    break;

                default:
                    break;
            }
        })
    })
    $('#back-btn').click(function () {
        switch (true) {
            case $('#portfolio-sec').is(':visible'): 
                $('#portfolio-sec').fadeOut(150, function () {
                    $('#schedule-vdo-sec').fadeIn(150)
                })
                break;
            case $('#video-content-sec').is(':visible'):
                $('#video-content-sec').fadeOut(150, function () {
                    $('#schedule-vdo-sec').fadeIn(150)
                })
                break;
            case $('#video-note-sec').is(':visible'):
                $('#video-note-sec').fadeOut(150, function () {
                    $('#schedule-vdo-sec').fadeIn(150)
                })
                break;
            case $('#photo-reference-sec').is(':visible'):
                $('#photo-reference-sec').fadeOut(150, function () {
                    $('#schedule-photo-sec').fadeIn(150)
                })
                break;
            case $('#photo-file-photo-sec').is(':visible'):
                $('#photo-file-photo-sec').fadeOut(150, function () {
                    $('#schedule-photo-sec').fadeIn(150)
                })
                break;
            case $('#onair-data-sec').is(':visible'):
                $('#onair-data-sec').fadeOut(150, function () {
                    $('#schedule-onair-sec').fadeIn(150)
                })
                break;
            default:
                $('#back-btn').fadeOut(150, function () {
                    $('#home-sec').find('section').fadeOut(150, function () {
                        $('#home-sec').find('section').hide()
                        $('#menu-sec').fadeIn(150)
                    })
                })
                break;
        }
    })
})


$(document).ready(() => {
    $('#sel-month, #sel-year').change(function () {
        $.LoadingOverlay("show");
        videoSetCalendar()
    })
    $('#photo-sel-month, #photo-sel-year').change(function () {
        $.LoadingOverlay("show");
        videoSetCalendar()
    })
    $('#onair-sel-month, #onair-sel-year').change(function () {
        $.LoadingOverlay("show");
        videoSetCalendar()
    })
    $('#sel-year, #photo-sel-year,  #onair-sel-year').val(new Date().getFullYear())
    $('#sel-month, #photo-sel-month,  #onair-sel-month').val(new Date().getMonth() + 1)
    $('.placeholder').click(function () {
        $(this).parent().find('input[type="file"]').click()
    })
    $('.has-preview').click(function () {
        let img = $(this).attr('src')
        let preview = $('<img>', { src: img, class: 'img-fluid' })
        $('#previewImageModal .modal-body').html('').append(preview)
        $('#previewImageModal').modal('show')
    })


})

function getThumbnail(url) {
    // check if url is google drive url
    if(url.indexOf('google') == -1) return url;

    let id = extractFileIdFromUrl(url);
    // size w2000-h2000
    var url = 'https://drive.google.com/thumbnail?id=' + id+'&sz=w2000-h2000';
    return url;
}

function extractFileIdFromUrl(url) {
    var fileId = url.match(/[-\w]{25,}/);
    return fileId[0];
}
