var portfolio_files
$(document).ready(() => {
    $('#portfolio-add-update-btn').click(function () {
        showAlertToselectModel()
    })
    $('#portfolio-del-btn').click(function () {
        showAlertToDelete()
    })
    $('#portfolio-add-update-form').submit(function () {
        if (event) event.preventDefault()
        let type = $(this).attr('data-type')
        let action = $(this).attr('data-action')
        portfolioSubmit(type, action)
    })
    $('#portfolioAddUpdateModal form input[type="file"]').change(function () {
        let id = $(this).attr('id')
        console.log($(this).closest('.row').find('.preview').length)
        if ($(this).prop('files').length == 0 || $(this).parent().find('.preview').length == 0) return
        let img = $(this)
        let file = $(this).prop('files')[0]
        let reader = new FileReader()
        reader.onloadend = function (e) {
            if (!portfolio_files) portfolio_files = {}
            portfolio_files[id] = {
                data: e.target.result,
                name: file.name,
            }
            console.log("🚀 ~ portfolio_files:", portfolio_files)
            $(img).parent().find('.placeholder').fadeOut(50, function () {
                $(img).parent().find('.preview').attr('referrerpolicy', 'no-referrer').attr('src', e.target.result).fadeIn(50)
            })
        }
        reader.readAsDataURL(file)
    })
    $('.select-character-btn').click(function () {
        event.preventDefault()
        $(this).parent().find('input').click()
    })

    $('#add-model-data-btn').click(function () {
        $('#portfolio-add-update-form').attr('data-type', 'portfolio_model')
        $('#portfolio-add-update-form').attr('data-action', 'add')
        portfolioAddUpdate()
    })
    $('#update-model-data-btn').click(function () {
        $('#portfolio-add-update-form').attr('data-type', 'portfolio_model')
        $('#portfolio-add-update-form').attr('data-action', 'update')
        portfolioFillData()
    })
})
function portfolioFillData() {
    let model_select = $('<select>', {
        class: 'form-select form-select-lg',
        id: 'swal-model-select',
    })
    let model_name = $('#portfolio-nickname').text().trim()
    Object.keys(model_list).forEach(v => {
        model_select.append($('<option>', {
            value: v,
            text: model_list[v]['name']
        }))
    })
    Swal.fire({
        icon: 'info',
        html: '<h3>กรุณาเลือกชื่อ Model ที่จะแก้ไข</h3><br>' +
            '<div class="row justify-content-center container-fluid"><div class="col text-center">' +
            $(model_select).prop('outerHTML') +
            '</div></div>',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'ปิด',
        confirmButtonText: 'ตกลง',
    }).then((result) => {
        if (result.isConfirmed) {
            $('#portfolio-add-update-form').attr('data-model', $('#swal-model-select').val())
            $('#portfolioAddUpdateModal').find('img').hide()
            $('#portfolioAddUpdateModal').find('input').val('')
            $('#portfolioAddUpdateModal').find('.placeholder').show()
            let select_model = model_list[$('#swal-model-select').val()]
            Object.keys(select_model).forEach(v => {
                console.log("🚀 ~ select_model[v]:", select_model[v])
                if (v.indexOf('character') == 0 && select_model[v] != '') {
                    let input_id = v.replace('character', 'modal-character').split(' ').join('-')
                    console.log("🚀 ~ aaaaaaainput_id:", input_id)
                    if(v.indexOf('voice') > -1){
                        $('#' + input_id + '-input').val(select_model[v]).attr('data-old', select_model[v]|| '')
                    }else{
                    
                        let src_img_id = select_model[v].split('/')[5]
                        let src_thumbnail_url = 'https://drive.google.com/thumbnail?id=' + src_img_id
                        $('#' + input_id + '-input').parent().find('img').attr('referrerpolicy', 'no-referrer').attr('src', src_thumbnail_url).show()
                        $('#' + input_id + '-input').parent().find('.placeholder').hide()
                    }
                }
            })
            let src_img_id = select_model['profile image'].split('/')[5]
            let src_thumbnail_url = 'https://drive.google.com/thumbnail?id=' + src_img_id
            $('#modal-profile-input').parent().find('img').attr('referrerpolicy', 'no-referrer').attr('src', src_thumbnail_url).show()
            $('#modal-profile-input').parent().find('.placeholder').hide()
            $('#modal-model-name-input').val(select_model['name']).attr('data-old', select_model['name'])
            $('#modal-tiktok-input').val(select_model['tiktok']).attr('data-old', select_model['tiktok'])
            $('#modal-instagram-input').val(select_model['instagram']).attr('data-old', select_model['instagram'])
            $('#modal-facebook-input').val(select_model['facebook']).attr('data-old', select_model['facebook'])

            portfolioAddUpdate(true)
        }
    })
}
function clearPortfolioSection() {
    $('#portfolio-sec').find('img').not('.not-hide').removeAttr('src').hide()
    $('#portfolio-sec').find('.placeholder').show()
    $('#portfolio-sec #portfolio-tiktok').text('').removeAttr('href')
    $('#portfolio-sec #portfolio-nickname').text('').removeAttr('href')
    $('#portfolio-sec #portfolio-instagram').text('').removeAttr('href')
    $('#portfolio-sec #portfolio-facebook').text('').removeAttr('href')
}
function showAlertToselectModel() {
    let model_select = $('<select>', {
        class: 'form-select form-select-lg',
        id: 'swal-model-select',
    })
    console.log("🚀 ~ model_list:", model_list)
    let model_name = $('#portfolio-nickname').text().trim()
    console.log("🚀 ~ model_name:", model_name)
    Object.keys(model_list).forEach(v => {
        model_select.append($('<option>', {
            value: v,
            text: model_list[v]['name']
        }))
    })
    $(model_select).find('option').each(function () {
        if ($(this).text() == model_name) {
            $(this).attr('selected', true)
        }
    })
    Swal.fire({
        icon: 'info',
        html: '<h2>กรุณาเลือกชื่อ Model ที่คุณต้องการ</h2><br>' +
            '<div class="row justify-content-center container-fluid"><div class="col text-center">' +
            $(model_select).prop('outerHTML') +
            '</div></div>',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'ปิด',
        confirmButtonText: 'ตกลง',
    }).then((result) => {
        if (result.isConfirmed) {
            let target = calendar_data[$('#sel-year').val()][$('#sel-month').val()].find(r => r[0] == $('#portfolio-add-update-btn').attr('data-date'))
            if (target && $('#swal-model-select').val() == target[2]) {
                // scroll to top
                return $('html, body').animate({
                    scrollTop: $("#home-sec").offset().top
                }, 500);
            }
            setPortFolioModel($('#portfolio-add-update-btn').attr('data-date'), $('#swal-model-select').val())
        }
    })
}
function showAlertToDelete() {
    Swal.fire({
        icon: 'warning',
        html: '<h2>คุณต้องการลบข้อมูลนี้ใช่หรือไม่</h2>',
        showCancelButton: true,
        cancelButtonText: 'ปิด',
        confirmButtonText: 'ลบเลย',
    }).then((result) => {
        if (result.isConfirmed) {
            portfolioDelete($('#portfolio-add-update-btn').attr('data-date'))
        }
    })
}
function portfolioAddUpdate(isupdate) {
    let title = isupdate ? 'แก้ไขข้อมูล Portfolio Model' : 'เพิ่มข้อมูล Portfolio Model'
    $('#portfolioAddUpdateModal .modal-title').text(title)
    if (!isupdate) {
        $('#portfolioAddUpdateModal').find('img').hide()
        $('#portfolioAddUpdateModal').find('input').val('')
        $('#portfolioAddUpdateModal').find('.placeholder').show()
    }
    $('#portfolioAddUpdateModal').modal('show')
}
function portfolioDelete(date) {
    $.LoadingOverlay("show");
    $.ajax({
        method: "POST",
        url: script_url,
        data: {
            opt: 'portfolio_delete',
            date: date,
        },
        success: function (response) {
            $.LoadingOverlay("hide");
            if (response.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'ลบข้อมูลเรียบร้อย',
                    confirmButtonText: 'ตกลง',
                    allowOutsideClick: false,
                }).then(() => {
                    // update calendar_data
                    let index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(r => r[0] == date)
                    if (index != -1) {
                        calendar_data[$('#sel-year').val()][$('#sel-month').val()][index][2] = ''
                    }
                    // update calendar
                    videoSetCalendar()
                    $('#back-btn').click()
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    html: '<h2>' + response.message + '</h2>',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }
    })
}
async function portfolioSubmit(type, action) {
    console.log("🚀 ~ action:", action)
    console.log("🚀 ~ type:", type)
    console.log("🚀 ~ portfolio_files:", portfolio_files)
    if (event) event.preventDefault()
    let form_obj = {
        model_name: $('#portfolio-add-update-form #modal-model-name-input').val(),
        tiktok: $('#portfolio-add-update-form #modal-tiktok-input').val(),
        instagram: $('#portfolio-add-update-form #modal-instagram-input').val(),
        facebook: $('#portfolio-add-update-form #modal-facebook-input').val(),
        voice1: $('#modal-character-voice-1-input').val(),
        voice2: $('#modal-character-voice-2-input').val(),
        voice3: $('#modal-character-voice-3-input').val(),
        voice4: $('#modal-character-voice-4-input').val(),
    }
    if (action == 'update') {
        form_obj.model_id = $('#portfolio-add-update-form').attr('data-model')
        let checkArr = [
            form_obj.model_name == $('#portfolio-add-update-form #modal-model-name-input').attr('data-old'),
            form_obj.tiktok == $('#portfolio-add-update-form #modal-tiktok-input').attr('data-old'),
            form_obj.instagram == $('#portfolio-add-update-form #modal-instagram-input').attr('data-old'),
            form_obj.facebook == $('#portfolio-add-update-form #modal-facebook-input').attr('data-old'),
            form_obj.voice1 == $('#modal-character-voice-1-input').attr('data-old'),
            form_obj.voice2 == $('#modal-character-voice-2-input').attr('data-old'),
            form_obj.voice3 == $('#modal-character-voice-3-input').attr('data-old'),
            form_obj.voice4 == $('#modal-character-voice-4-input').attr('data-old'),
        ]
        if (!portfolio_files && checkArr.every(c => c)) {
            return Swal.fire({
                icon: 'error',
                html: '<h2>ไม่มีการแก้ไขข้อมูล</h2>',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                $('#portfolioAddUpdateModal').modal('hide')
            })
        }
    }
    if (portfolio_files) {
        let files_count = Object.keys(portfolio_files).length
        let count = 0
        let percent = count / files_count * 100
        Swal.fire({
            title: 'กำลังอัพโหลดไฟล์',
            html: percent + ' %<br><br><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div></div>',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })
        // send post request in same time
        let upload_res = []
        $.when(...Object.keys(portfolio_files).map(f => {
            console.log("🚀 ~ f:", portfolio_files[f].name)
            // if(!portfolio_files[f].data) return 'no file'
            let obj = {
                opt: 'uploadfile',
                type: type,
                action: action,
                file: portfolio_files[f].data,
                name: type + " " + f,
                key: f
            }
            return $.ajax({
                method: 'POST',
                url: script_url,
                data: obj,
                dataType: 'json',
                success: function (res) {
                    console.log("🚀 ~ res:", res)
                    upload_res.push(res)
                    if (res.status == 'success') {
                        count++
                        percent = Math.round(count / files_count * 100)
                        Swal.update({
                            html: percent + ' %<br><br><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: ' + percent + '%"></div></div>',
                            allowOutsideClick: false,
                            showConfirmButton: false,
                            didOpen: () => {
                                Swal.showLoading()
                            }
                        })
                        if (count == files_count) {
                            setTimeout(() => {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'อัพโหลดไฟล์สำเร็จ',
                                    showConfirmButton: false,
                                    timer: 1000
                                }).then(() => {
                                    uploadData(form_obj, type, action, upload_res)
                                })
                            }, 500)
                        }
                    }
                }
            })
        }))
    } else {
        uploadData(form_obj, type, action, [])
    }
    portfolio_files = undefined
}
function uploadData(form_obj, type, action, upload_res) {
    Swal.fire({
        title: 'กำลังบันทึกข้อมูล',
        text: 'กรุณารอสักครู่',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
    form_obj.opt = 'uploaddata'
    form_obj.type = type
    form_obj.action = action
    upload_res.forEach(res => {
        form_obj[res.key] = res.url
    })
    //  send post request
    $.ajax({
        method: 'POST',
        url: script_url,
        data: form_obj,
        dataType: 'json',
        success: function (res) {
            console.log("🚀 ~ res:", res)
            if (res.status == 'success') {
                model_list = res.list
                // $('#portfolioAddUpdateModal .modal-body').animate({ scrollTop: 0 }, 500)
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกข้อมูลสำเร็จ',
                    timer: 4000
                })
            }
        }
    })
}
function setPortFolioModel(date, model, update = true) {
    console.log("🚀 ~ model:", model)
    $('#portfolio-sec .placeholder').show()
    $('#portfolio-sec img').not('.not-hide').hide()
    let arr = [
        "modal-character-sexy-1-input",
        "modal-character-sexy-2-input",
        "modal-character-sexy-3-input",
        "modal-character-sexy-4-input",
        "modal-character-comedy-1-input",
        "modal-character-comedy-2-input",
        "modal-character-comedy-3-input",
        "modal-character-comedy-4-input",
        "modal-character-sweet-1-input",
        "modal-character-sweet-2-input",
        "modal-character-sweet-3-input",
        "modal-character-sweet-4-input",
        "modal-character-voice-1-input",
        "modal-character-voice-2-input",
        "modal-character-voice-3-input",
        "modal-character-voice-4-input"
    ]
    let model_obj = model_list[model]
  console.log(model_obj)
    $('#portfolio-sec #portfolio-nickname').text(model_obj.name)
    if (model_obj.tiktok && model_obj.tiktok != '') {
        $('#portfolio-sec #portfolio-tiktok').attr('href', model_obj.tiktok).attr('target', '_blank').text('เปิด Tiktok').parent().show()
    } else {
        $('#portfolio-sec #portfolio-tiktok').parent().hide()
    }

    if (model_obj.instagram && model_obj.instagram != '') {
        $('#portfolio-sec #portfolio-instagram').attr('href', model_obj.instagram).attr('target', '_blank').text('เปิด Instagram').parent().show()
    } else {
        $('#portfolio-sec #portfolio-instagram').parent().hide()
    }

    if (model_obj.facebook && model_obj.facebook != '') {
        $('#portfolio-sec #portfolio-facebook').attr('href', model_obj.facebook).attr('target', '_blank').text('เปิด Facebook').parent().show()
    } else {
        $('#portfolio-sec #portfolio-facebook').parent().hide()
    }
    let profile_img_url
  if(model_obj['profile image'].indexOf('drive.google') > -1){
    let profile_img_id = extractFileIdFromUrl(model_obj['profile image'])
    profile_img_url = 'https://drive.google.com/thumbnail?id=' + profile_img_id + '&sz=w1000-h1000-p-k-nu'
  }else{
    profile_img_url = model_obj['profile image']
  }
    $('#portfolio-sec #portfolio-profile').attr('referrerpolicy', 'no-referrer').attr('src', profile_img_url).show()
    $('#portfolio-sec #portfolio-profile').parent().find('.placeholder').hide()
    $('#portfolio-charactor-voice-div').empty()
    arr.forEach(key => {
        let obj_key = key.replace('modal-', '').replace('-input', '').replace(/-/g, ' ')
        console.log("🚀 ~ obj_key:", obj_key)
        if (model_obj[obj_key] && model_obj[obj_key] != '') {
            if (obj_key.split(' ')[1] == 'voice') {
                let div = $('<div>',{class: 'col-12'}).append($('<a>',{href: model_obj[obj_key],target: '_blank',text: model_obj[obj_key]}))
                $('#portfolio-charactor-voice-div').append(div)
            } else {
              let thumbnail_url
              if(model_obj[obj_key].indexOf('drive.google') > -1){
                let fileid = extractFileIdFromUrl(model_obj[obj_key])
                thumbnail_url = 'https://drive.google.com/thumbnail?id=' + fileid + '&sz=w1000-h1000-p-k-nu'
              }else{
                thumbnail_url = model_obj[obj_key]
              }
              console.log(thumbnail_url)
                let ele_id = obj_key.split(' ')
                ele_id = 'portfolio-' + ele_id[1] + '-img-' + ele_id[2]
                $('#portfolio-sec #' + ele_id).attr('referrerpolicy', 'no-referrer').attr('src', thumbnail_url).show()
                $('#portfolio-sec #' + ele_id).parent().find('.placeholder').hide()
            }
        }
    })
    if (update) {
        $.LoadingOverlay('show')
        $.ajax({
            method: 'POST',
            url: script_url,
            data: {
                opt: 'add-date-portfolio-model',
                date: date,
                model: model,
            },
            dataType: 'json',
            success: function (res) {
                $.LoadingOverlay('hide')
                setTimeout(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกข้อมูลสำเร็จ',
                        timer: 4000,
                        confirmButtonText: 'ตกลง'
                    }).then(() => {
                        $('html, body').animate({
                            scrollTop: $("#home-sec").offset().top
                        }, 500);
                    })
                }, 200)
                // {
                //     "2023": {
                //         "3": [
                //             [
                //                 "2023-03-09",
                //                 "2023-03-09T16:26:19.037Z",
                //                 "M0001"
                //             ],
                //             [
                //                 "2023-03-21",
                //                 "M0001",
                //                 "M0002"
                //             ]
                //         ]
                //     }
                // }
                let index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(arr => arr[0] == date)
                if (index != -1) {
                    calendar_data[$('#sel-year').val()][$('#sel-month').val()][index][2] = model
                } else {
                    calendar_data[$('#sel-year').val()][$('#sel-month').val()].push([date, date, model])
                }
                console.log("🚀 ~ calendar_data:", calendar_data)
                videoSetCalendar()
            }
        })
    }
    // scroll to top
    $('html, body').animate({
        scrollTop: $("#home-sec").offset().top
    }, 500);
}