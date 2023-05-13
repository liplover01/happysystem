$('document').ready(() => {
    $('#photo-file-photo-add-btn').click(function () {
        let date = $('#photo-file-photo-modal-div').attr('data-date')
        let type = 'add'

        showModalToAddUpdateFilePhoto(date, type)
    })
    $('#photoFilePhotoModalAddBtn').click(function () {
        let parent = $(this).closest('.modal-body').find('.form-floating').first().parent()
        let input = parent.clone()
        input.find('input').val('')
        parent.parent().append(input)
    })
    $('#photoFilePhotoModalBtn').click(function () {
        let type = $('#photo-file-photo-modal-div').attr('data-type')
        let date = $('#photo-file-photo-modal-div').attr('data-date')
        if (type == 'add') {
            console.log('add');
            photoAddFilePhoto(date)
        } else {
            console.log('update');
            photoUpdateFilePhoto(date)
        }
    })
})

function clearFilePhotoSection() {
    $('#photo-file-photo-sec').find('.file-photo-div').not('.file-photo-template').remove()
}

function showModalToAddUpdateFilePhoto(date, type) {
    $('#photo-file-photo-modal-div').find('.form-floating').not(':first').remove()
    $('#photo-file-photo-modal-div').find('input').val('')
    console.log('showmodal')
    console.log("🚀 ~ date:", date)
    $('#photo-file-photo-modal-div').attr('data-type', type)
    $('#photo-file-photo-modal-div').attr('data-date', date)
    let title
    if (type == 'add') {
        title = 'เพิ่มไฟล์'
        $('#photoFilePhotoModalAddBtn').show()
    } else {
        title = 'แก้ไขไฟล์'
        $('#photoFilePhotoModalAddBtn').hide()
        $('#photo-file-photo-modal-div').find('input').val($('img[data-id=' + $('#photo-file-photo-modal-div').attr('data-id') + ']').attr('src'))
    }
    $('#photoFilePhotoModal').modal('show')
    $('#photoFilePhotoModalLabel').text(title)
    console.log(file_photo_date)
}

let file_photo_date = {}
function setFilePhotoData(date) {
    $.LoadingOverlay("show");
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'get_photo_file_photo',
            date: date
        },
        success: function (res) {
            $.LoadingOverlay("hide");
            console.log("🚀 ~ res:", res)
            file_photo_date[date] = res.file_photo.map(a => {
                return { id: a[2], file_photo: a[3] }
            })
            console.log("🚀 ~ file_photo_date:", file_photo_date)
            appendFilePhotoData(date)
        }
    })
}

function appendFilePhotoData(date, targetID) {
    
    $('#photo-file-photo-sec').find('.file-photo-div').not('.file-photo-template').remove()
    file_photo_date[date].forEach((obj, i) => {
        let editor = $('.file-photo-template').clone()
        editor.removeClass('file-photo-template')
        editor.show()
        editor.addClass('d-flex flex-column')
        $('.file-photo-template').hide()
        editor.attr('id', 'file-photo-' + date + '-' + (i + 1))
        console.log("🚀 ~ editor:", editor)
        let thumbnail = getThumbnail(obj.file_photo)
        editor.find('.photo-file-photo').attr('referrerpolicy', 'no-referrer')
        .attr('src', thumbnail).attr('data-id', obj.id).click(function () {
            let img = $(this).attr('src')
            let preview = $('<img>', { src: img, class: 'img-fluid' })
            $('#previewImageModal .modal-body').html('').append(preview)
            $('#previewImageModal').modal('show')
        })
        editor.find('button[name="file_edit"] , button[name="file_delete"]').attr('data-id', obj.id)
        editor.find('.h5').text('File #' + (i + 1))
        $('.file-photo-template').parent().append(editor)
    });

    if (targetID) {
        let targetElement = $('img[data-id="' + targetID + '"]').closest('.file-photo-div')
        $('html, body').animate({
            scrollTop: targetElement.offset().top
        }, 500);
    }

    $('button[name="file_edit"]').click(function () {
        let file_id = $(this).attr('data-id')
        let date = $('#photo-file-photo-modal-div').attr('data-date')
        $('#photo-file-photo-modal-div').attr('data-id', file_id)
        console.log("🚀 ~ file_id:", file_id)
        // let file = file_photo_date[date].find(a => {
        //     console.log("🚀 ~ a:", a)
        //     return a.id == file_id
        // })
        showModalToAddUpdateFilePhoto(date, 'update')
    })

    $('button[name="file_delete"]').click(function () {
        let date = $('#photo-file-photo-modal-div').attr('data-date')
        Swal.fire({
            title: 'คุณต้องการลบไฟล์นี้ใช่หรือไม่?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `ใช่ ลบได้เลย`,
            denyButtonText: `ไม่ ยกเลิก`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'info',
                    html: '<h2>กำลังลบไฟล์<h2>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
                let file_id = $(this).attr('data-id')
                $('#video-content-editor').attr('data-id', file_id)
                console.log("🚀 ~ file_id:", file_id)
                $.ajax({
                    method: 'POST',
                    url: script_url,
                    data: {
                        opt: 'delete_photo_file_photo',
                        id: file_id
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'ลบไฟล์สำเร็จ',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                let date = $('#photo-file-photo-modal-div').attr('data-date')
                                let index = file_photo_date[date].findIndex(a => a.id == file_id)
                                if (index > -1) file_photo_date[date].splice(index, 1)
                                if(file_photo_date[date].length == 0){
                                    let year = date.split('-')[0]
                                    let month = Number(date.split('-')[1])
                                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                                    if (calendar_index > -1){
                                        calendar_data[year][month][calendar_index][5] = "NO"
                                    }
                                }
                                appendFilePhotoData(date)
                            })
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: res.message,
                            })
                        }
                    }
                })
            }
        })

    })
}


function photoAddFilePhoto(date) {
    console.log("🚀 ~ date:", date)
    let file_photo = $('#photoFilePhotoModal').find('.photo-file-photo-input').toArray().map(a => {
        return $(a).val()
    }).filter((item) => item != '')
    console.log("🚀 ~ file_photo:", file_photo)
    if (file_photo.length == 0) return
    let file_photo_obj = {}
    file_photo.forEach((item, i) => {
        file_photo_obj[i + 1] = item
    })
    console.log("🚀 ~ file_photo_obj:", file_photo_obj)
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังเพิ่มไฟล์ใหม่<h2>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })


    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'add_photo_file_photo',
            date: date,
            file_photo: JSON.stringify(file_photo_obj)
        },
        success: function (res) {
            console.log("🚀 ~ res:", res);
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มไฟล์สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#photoFilePhotoModal').modal('hide')
                    if (!file_photo_date[date]) file_photo_date[date] = []
                    if (res.file_photo.length > 0) {
                        res.file_photo.forEach((item, i) => {
                            file_photo_date[date].push({ id: item.id, file_photo: item.file_photo })
                        })
                    }
                    console.log("🚀 ~ file_photo_date:", file_photo_date)
                    let year = date.split('-')[0]
                    let month = Number(date.split('-')[1])
                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                    if (calendar_index > -1) {
                        calendar_data[year][month][calendar_index][5] = "YES"
                    }
                    appendFilePhotoData(date, res.file_photo[0].id)
                })
            }
        }
    })




}

function photoUpdateFilePhoto(date) {
    console.log("🚀 ~ date:", date)
    let text = $('#photo-file-photo-modal-div').find('.photo-file-photo-input').val()
    if (text == '') return
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังบันทึกไฟล์<h2>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    let id = $('#photo-file-photo-modal-div').attr('data-id')
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'update_photo_file_photo',
            date: date,
            url: text,
            id: id
        },
        success: function (res) {
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกไฟล์สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#photoFilePhotoModal').modal('hide')
                    if (!file_photo_date[date]) file_photo_date[date] = []
                    if (text != '') {
                        let index = file_photo_date[date].findIndex(a => a.id == id)
                        if (index > -1) file_photo_date[date][index] = { file_photo: text, id: id }
                    }

                    appendFilePhotoData(date, id)
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                })
            }
        }
    })




}
