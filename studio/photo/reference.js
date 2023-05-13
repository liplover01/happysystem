$('document').ready(() => {
    $('#photo-reference-add-btn').click(function () {
        let date = $('#photo-reference-modal-div').attr('data-date')
        let type = 'add'
    
        showModalToAddUpdateReference(date, type)
    })
    $('#photoReferenceModalAddBtn').click(function () {
        let parent = $(this).closest('.modal-body').find('.form-floating').first().parent()
        let input = parent.clone()
        input.find('input').val('')
        parent.parent().append(input)
    })
    $('#photoReferenceModalBtn').click(function () {
        let type = $('#photo-reference-modal-div').attr('data-type')
        let date = $('#photo-reference-modal-div').attr('data-date')
        if (type == 'add') {
            console.log('add');
            photoAddReference(date)
        } else {
            console.log('update');
            photoUpdateReference(date)
        }
    })
})

function clearReferenceSection() {
    $('#photo-reference-sec').find('.reference-div').not('.reference-template').remove()
}

function showModalToAddUpdateReference(date, type) {
    $('#photo-reference-modal-div').find('.form-floating').not(':first').remove()
    $('#photo-reference-modal-div').find('input').val('')
    console.log('showmodal')
    console.log("🚀 ~ date:", date)
    $('#photo-reference-modal-div').attr('data-type', type)
    $('#photo-reference-modal-div').attr('data-date', date)
    let title
    if (type == 'add') {
        title = 'เพิ่ม Reference'
        $('#photoReferenceModalAddBtn').show()
    } else {
        title = 'แก้ไข Reference'
        $('#photoReferenceModalAddBtn').hide()
        $('#photo-reference-modal-div').find('input').val($('img[data-id=' + $('#photo-reference-modal-div').attr('data-id') + ']').attr('src'))
    }
    $('#photoReferenceModal').modal('show')
    $('#photoReferenceModalLabel').text(title)
    console.log(reference_date)
}

let reference_date = {}
function setReferenceData(date) {
    clearReferenceSection()
    $.LoadingOverlay("show");
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'get_photo_reference',
            date: date
        },
        success: function (res) {
            
            $.LoadingOverlay("hide");
            console.log("🚀 ~ res:", res)
            reference_date[date] = res.reference.map(a => {
                return { id: a[2], reference: a[3] }
            })
            console.log("🚀 ~ reference_date:", reference_date)
            appendReferenceData(date)
        }
    })
}

function appendReferenceData(date, targetID) {
    
    $('#photo-reference-sec').find('.reference-div').not('.reference-template').remove()
    reference_date[date].forEach((obj, i) => {
        let editor = $('.reference-template').clone()
        editor.removeClass('reference-template')
        editor.show()
        editor.addClass('d-flex flex-column')
        $('.reference-template').hide()
        editor.attr('id', 'reference-' + date + '-' + (i + 1))
        console.log("🚀 ~ editor:", editor)
        let thumbnail = getThumbnail(obj.reference)
        editor.find('.photo-reference').attr('referrerpolicy', 'no-referrer')
        .attr('src',thumbnail ).attr('data-id', obj.id).click(function () {
            let img = $(this).attr('src')
            let preview = $('<img>', { src: img, class: 'img-fluid' })
            $('#previewImageModal .modal-body').html('').append(preview)
            $('#previewImageModal').modal('show')
        })
        editor.find('button[name="ref_edit"] , button[name="ref_delete"]').attr('data-id', obj.id)
        editor.find('.h5').text('Ref #' + (i + 1))
        $('.reference-template').parent().append(editor)
    });

    if (targetID) {
        let targetElement = $('img[data-id="' + targetID + '"]').closest('.reference-div')
        $('html, body').animate({
            scrollTop: targetElement.offset().top
        }, 500);
    }

    $('button[name="ref_edit"]').click(function () {
        let ref_id = $(this).attr('data-id')
        let date = $('#photo-reference-modal-div').attr('data-date')
        $('#photo-reference-modal-div').attr('data-id', ref_id)
        console.log("🚀 ~ ref_id:", ref_id)
        // let ref = reference_date[date].find(a => {
        //     console.log("🚀 ~ a:", a)
        //     return a.id == ref_id
        // })
        showModalToAddUpdateReference(date, 'update')
    })

    $('button[name="ref_delete"]').click(function () {
        let date = $('#photo-reference-modal-div').attr('data-date')
        Swal.fire({
            title: 'คุณต้องการลบ Reference นี้ใช่หรือไม่?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `ใช่ ลบได้เลย`,
            denyButtonText: `ไม่ ยกเลิก`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'info',
                    html: '<h2>กำลังลบ Reference<h2>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
                let ref_id = $(this).attr('data-id')
                $('#video-content-editor').attr('data-id', ref_id)
                console.log("🚀 ~ ref_id:", ref_id)
                $.ajax({
                    method: 'POST',
                    url: script_url,
                    data: {
                        opt: 'delete_photo_reference',
                        id: ref_id
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'ลบ Reference สำเร็จ',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                let date = $('#photo-reference-modal-div').attr('data-date')
                                let index = reference_date[date].findIndex(a => a.id == ref_id)
                                if (index > -1) reference_date[date].splice(index, 1)
                                if (reference_date[date].length == 0) {
                                    let year = date.split('-')[0]
                                    let month = Number(date.split('-')[1])
                                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                                    if (calendar_index > -1) {
                                        calendar_data[year][month][calendar_index][4] = "NO"
                                    }
                                }
                                appendReferenceData(date)
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


function photoAddReference(date) {
    console.log("🚀 ~ date:", date)
    let references = $('#photoReferenceModal').find('.photo-reference-input').toArray().map(a => {
        return $(a).val()
    }).filter((item) => item != '')
    console.log("🚀 ~ references:", references)
    if (references.length == 0) return
    let reference_obj = {}
    references.forEach((item, i) => {
        reference_obj[i + 1] = item
    })
    console.log("🚀 ~ reference_obj:", reference_obj)
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังเพิ่ม References ใหม่<h2>',
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
            opt: 'add_photo_reference',
            date: date,
            reference: JSON.stringify(reference_obj)
        },
        success: function (res) {
            console.log("🚀 ~ res:", res);
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่ม References สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#photoReferenceModal').modal('hide')
                    if (!reference_date[date]) reference_date[date] = []
                    if (res.reference.length > 0) {
                        res.reference.forEach((item, i) => {
                            reference_date[date].push({ id: item.id, reference: item.ref })
                        })
                    }
                    console.log("🚀 ~ reference_date:", reference_date)
                    let year = date.split('-')[0]
                    let month = Number(date.split('-')[1])
                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                    if (calendar_index > -1) {
                        calendar_data[year][month][calendar_index][4] = "YES"
                    }
                    appendReferenceData(date, res.reference[0].id)
                })
            }
        }
    })




}

function photoUpdateReference(date) {
    console.log("🚀 ~ date:", date)
    let text = $('#photo-reference-modal-div').find('.photo-reference-input').val()
    if (text == '') return
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังบันทึก Reference<h2>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    let id = $('#photo-reference-modal-div').attr('data-id')
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'update_photo_reference',
            date: date,
            url: text,
            id: id
        },
        success: function (res) {
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึก Reference สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#photoReferenceModal').modal('hide')
                    if (!reference_date[date]) reference_date[date] = []
                    if (text != '') {
                        let index = reference_date[date].findIndex(a => a.id == id)
                        if (index > -1) reference_date[date][index] = { reference: text, id: id }
                    }

                    appendReferenceData(date, id)
                })
            }else{
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                })
            }
        }
    })




}