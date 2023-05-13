var note_editor
$('document').ready(() => {
    note_editor = new Quill('#video-note-editor', {
        modules: {
            toolbar: true
        },
        placeholder: 'เขียนข้อความ...',
        theme: 'snow',
    });
    $('#video-note-add-btn').click(function () {
        let date = $('#video-note-editor').attr('data-date')
        let type = 'add'
        showModalToAddUpdateNote(date, type)
    })
    $('#videoNoteModalBtn').click(function () {
        let type = $('#video-note-editor').attr('data-type')
        let date = $('#video-note-editor').attr('data-date')
        if (type == 'add') {
            videoAddNoteEditor(date)
        } else {
            videoUpdateNoteEditor(date)
        }
    })
})
function clearNoteSection() {
    $('#video-note-sec').find('.note-div').not('.note-template').remove()
}

function showModalToAddUpdateNote(date, type) {
    console.log('showmodal')
    console.log("🚀 ~ date:", date)
    $('#video-note-editor').attr('data-type', type)
    $('#video-note-editor').attr('data-date', date)
    let title
    if (type == 'add') {
        title = 'เพิ่ม Todo List'
        note_editor.setText('');
        $('#video-note-done').prop('checked', false)
    } else {
        title = 'แก้ไข Todo List'
    }
    $('#videoNoteModal').modal('show')
    $('#videoNoteModalLabel').text(title)
    console.log(notes_date)
}

let notes_date = {}
function setNoteData(date) {
    clearNoteSection()
    $.LoadingOverlay("show");
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'get_video_note',
            date: date
        },
        success: function (res) {
            $.LoadingOverlay("hide");
            console.log("🚀 ~ res:", res)
            notes_date[date] = res.note.map(a => {
                return { date: date, id: a[2], note: a[3], done: a[4] }
            })
            console.log("🚀 ~ notes_date:", notes_date)
            appendNoteData(date)
        }
    })
}

function appendNoteData(date, targetID) {
    let text_date = date.split('-')
    text_date = text_date[2] + '/' + text_date[1] + '/' + text_date[0]

    $('#video-note-date').text('วันที่ ' + text_date)
    $('#video-note-sec').find('.note-div').not('.note-template').remove()
    notes_date[date].forEach((obj, i) => {
        let editor = $('.note-template').clone()
        editor.removeClass('note-template')
        $('.note-template').hide()
        editor.attr('id', 'note-' + date + '-' + (i + 1))
        console.log("🚀 ~ editor:", editor)
        let container = editor.find('.note-editor').html(obj.note).attr('data-id', obj.id)
        editor.find('button[name="note_edit"] , button[name="note_delete"]').attr('data-id', obj.id)
        console.log("🚀 ~ container:", container)
        if(obj.done == 'done'){
            editor.find('.display-5').html('todo list #' + (i + 1) + '&nbsp;&nbsp;<i class="bi bi-check-circle-fill text-success"></i>')
            container.addClass('bg-success-subtle')
        }else{
            editor.find('.display-5').html('todo list #' + (i + 1))
        }
        editor.show()
        $('#video-note-sec').append(editor)
    });

    if (targetID) {
        let targetElement = $('[data-id="' + targetID + '"]').not('button').closest('.note-div')
        $('html, body').animate({
            scrollTop: targetElement.offset().top
        }, 500);
    }

    $('button[name="note_edit"]').click(function () {
        let note_id = $(this).attr('data-id')
        let date = $('#video-note-editor').attr('data-date')
        $('#video-note-editor').attr('data-id', note_id)
        console.log("🚀 ~ note_id:", note_id)
        let note = notes_date[date].find(a => {
            console.log("🚀 ~ a:", a)
            return a.id == note_id
        })
        console.log("🚀 ~ note:", note)
        let delta = note_editor.clipboard.convert(note.note)
        console.log("🚀 ~ delta:", delta)
        note_editor.setContents(delta)
        $('#video-note-done').prop('checked', note.done == 'done'? true : false)
        showModalToAddUpdateNote(date, 'update')
    })

    $('button[name="note_delete"]').click(function () {
        Swal.fire({
            title: 'คุณต้องการลบ Todo list นี้ใช่หรือไม่?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `ใช่ ลบได้เลย`,
            denyButtonText: `ไม่ ยกเลิก`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'info',
                    html: '<h2>กำลังลบ Todo list<h2>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
                let note_id = $(this).attr('data-id')
                $('#video-note-editor').attr('data-id', note_id)
                console.log("🚀 ~ note_id:", note_id)
                $.ajax({
                    method: 'POST',
                    url: script_url,
                    data: {
                        opt: 'delete_video_note',
                        id: note_id
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'ลบ Todo list สำเร็จ',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                let date = $('#video-note-editor').attr('data-date')
                                let index = notes_date[date].findIndex(a => a.id == note_id)
                                if (index > -1) notes_date[date].splice(index, 1)
                                if (notes_date[date].length == 0) {
                                    let year = date.split('-')[0]
                                    let month = Number(date.split('-')[1])
                                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                                    if (calendar_index > -1) {
                                        calendar_data[year][month][calendar_index][3] = "NO"
                                    }
                                }
                                appendNoteData(date)
                            })
                        }
                    }
                })
            }
        })

    })
}

function videoAddNoteEditor(date) {
    console.log("🚀 ~ date:", date)
    let text = $('#video-note-editor .ql-editor').html()
    console.log("🚀 ~ text:", text)
    if (text == '' || text == '<p><br></p>') return
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังเพิ่ม Todo list ใหม่<h2>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    let done = $('#video-note-done').is(':checked') ? 'done': ''
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'add_video_note',
            date: date,
            note: text,
            done: done
        },
        success: function (res) {
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่ม Todo list สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#videoNoteModal').modal('hide')
                    if (!notes_date[date]) notes_date[date] = []
                    if (text != '' && text != '<p><br></p>') notes_date[date].push({ note: text, id: res.id, done: done })
                    let year = date.split('-')[0]
                    let month = Number(date.split('-')[1])
                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                    if (calendar_index > -1) {
                        calendar_data[year][month][calendar_index][3] = "YES"
                    }
                    appendNoteData(date, res.id)
                })
            }
        }
    })




}
function videoUpdateNoteEditor(date) {
    console.log("🚀 ~ date:", date)
    let text = $('#video-note-editor .ql-editor').html()
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

    let id = $('#video-note-editor').attr('data-id')
    let done = $('#video-note-done').is(':checked') ? 'done' : ''
    console.log("🚀 ~ id:", id)
    console.log("🚀 ~ notes_date:", notes_date);
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'update_video_note',
            date: date,
            note: text,
            done: done,
            id: id
        },
        success: function (res) {
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึก Todo List สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#videoNoteModal').modal('hide')
                    if (!notes_date[date]) notes_date[date] = []
                    if (text != '' && text != '<p><br></p>') {
                        let index = notes_date[date].findIndex(a => a.id == id)
                        if (index > -1) {
                            notes_date[date][index].note = text
                            notes_date[date][index].id = id
                            notes_date[date][index].done = done
                        }
                    }
                    appendNoteData(date, id)
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