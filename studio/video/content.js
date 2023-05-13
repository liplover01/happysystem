var content_editor
$('document').ready(() => {
    content_editor = new Quill('#video-content-editor', {
        modules: {
            toolbar: true
        },
        placeholder: 'เขียนข้อความ...',
        theme: 'snow',
    });
    $('#video-content-add-btn').click(function () {
        let date = $('#video-content-editor').attr('data-date')
        let type = 'add'
        showModalToAddUpdateContent(date, type)
    })
    $('#videoContentModalBtn').click(function () {
        let type = $('#video-content-editor').attr('data-type')
        let date = $('#video-content-editor').attr('data-date')
        if (type == 'add') {
            videoAddContentEditor(date)
        } else {
            videoUpdateContentEditor(date)
        }
    })
})

function clearContentSection() {
    $('#video-content-sec').find('.content-div').not('.content-template').remove()
}

function showModalToAddUpdateContent(date, type) {
    console.log('showmodal')
    console.log("🚀 ~ date:", date)
    $('#video-content-editor').attr('data-type', type)
    $('#video-content-editor').attr('data-date', date)
    let title
    if (type == 'add') {
        title = 'เพิ่ม Content'
        content_editor.setText('');
    } else {
        title = 'แก้ไข Content'
    }
    $('#videoContentModal').modal('show')
    $('#videoContentModalLabel').text(title)
    console.log(contents_date)
}

function videoAddContentEditor(date) {
    console.log("🚀 ~ date:", date)
    let text = $('#video-content-editor .ql-editor').html()
    console.log("🚀 ~ text:", text)
    if (text == '' || text == '<p><br></p>') return
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังเพิ่ม Content ใหม่<h2>',
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
            opt: 'add_video_content',
            date: date,
            content: text
        },
        success: function (res) {
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่ม Content สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#videoContentModal').modal('hide')
                    if (!contents_date[date]) contents_date[date] = []
                    if (text != '' && text != '<p><br></p>') contents_date[date].push({ content: text, id: res.id })
                    let year = date.split('-')[0]
                    let month = Number(date.split('-')[1])
                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                    if (calendar_index > -1) {
                        calendar_data[year][month][calendar_index][2] = "YES"
                    }
                    appendContentData(date, res.id)
                })
            }
        }
    })




}
function videoUpdateContentEditor(date) {
    console.log("🚀 ~ date:", date)
    let text = $('#video-content-editor .ql-editor').html()
    console.log("🚀 ~ text:", text)
    if (text == '' || text == '<p><br></p>') return
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังบันทึก Content<h2>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    let id = $('#video-content-editor').attr('data-id')
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'update_video_content',
            date: date,
            content: text,
            id: id
        },
        success: function (res) {
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึก Content สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#videoContentModal').modal('hide')
                    if (!contents_date[date]) contents_date[date] = []
                    if (text != '' && text != '<p><br></p>') {
                        let index = contents_date[date].findIndex(a => a.id == id)
                        if (index > -1) contents_date[date][index] = { content: text, id: id }
                    }

                    appendContentData(date, id)
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

let contents_date = {}
function setContentData(date) {
    clearContentSection()
    $.LoadingOverlay("show");
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'get_video_content',
            date: date
        },
        success: function (res) {
            $.LoadingOverlay("hide");
            console.log("🚀 ~ res:", res)
            contents_date[date] = res.contents.map(a => {
                return { date: date, id: a[2], content: a[3] }
            })
            console.log("🚀 ~ contents_date:", contents_date)
            appendContentData(date)
        }
    })
}

function appendContentData(date, targetID) {
    let text_date = date.split('-')
    text_date = text_date[2] + '/' + text_date[1] + '/' + text_date[0]

    $('#video-content-date').text('วันที่ ' + text_date)
    $('#video-content-sec').find('.content-div').not('.content-template').remove()
    contents_date[date].forEach((obj, i) => {
        let editor = $('.content-template').clone()
        editor.removeClass('content-template')
        $('.content-template').hide()
        editor.attr('id', 'content-' + date + '-' + (i + 1))
        console.log("🚀 ~ editor:", editor)
        let container = editor.find('.content-editor').html(obj.content).attr('data-id', obj.id)
        editor.find('button[name="editor_edit"] , button[name="editor_delete"]').attr('data-id', obj.id)
        console.log("🚀 ~ container:", container)
        editor.find('.display-5').text('Content #' + (i + 1))
        editor.show()
        $('#video-content-sec').append(editor)
    });

    if (targetID) {
        let targetElement = $('[data-id="' + targetID + '"]').not('button').closest('.content-div')
        $('html, body').animate({
            scrollTop: targetElement.offset().top
        }, 500);
    }

    $('button[name="editor_edit"]').click(function () {
        let content_id = $(this).attr('data-id')
        let date = $('#video-content-editor').attr('data-date')
        $('#video-content-editor').attr('data-id', content_id)
        console.log("🚀 ~ content_id:", content_id)
        let content = contents_date[date].find(a => {
            console.log("🚀 ~ a:", a)
            return a.id == content_id
        })
        console.log("🚀 ~ content:", content)
        let delta = content_editor.clipboard.convert(content.content)
        console.log("🚀 ~ delta:", delta)
        content_editor.setContents(delta)
        showModalToAddUpdateContent(date, 'update')
    })

    $('button[name="editor_delete"]').click(function () {
        Swal.fire({
            title: 'คุณต้องการลบ Content นี้ใช่หรือไม่?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `ใช่ ลบได้เลย`,
            denyButtonText: `ไม่ ยกเลิก`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'info',
                    html: '<h2>กำลังลบ Content<h2>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
                let content_id = $(this).attr('data-id')
                $('#video-content-editor').attr('data-id', content_id)
                console.log("🚀 ~ content_id:", content_id)
                $.ajax({
                    method: 'POST',
                    url: script_url,
                    data: {
                        opt: 'delete_video_content',
                        id: content_id
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'ลบ Content สำเร็จ',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                let date = $('#video-content-editor').attr('data-date')
                                let index = contents_date[date].findIndex(a => a.id == content_id)
                                if (index > -1) contents_date[date].splice(index, 1)
                                if (contents_date[date].length == 0) {
                                    let year = date.split('-')[0]
                                    let month = Number(date.split('-')[1])
                                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                                    if (calendar_index > -1) {
                                        calendar_data[year][month][calendar_index][5] = "NO"
                                    }
                                }
                                appendContentData(date)
                            })
                        }
                    }
                })
            }
        })

    })
}