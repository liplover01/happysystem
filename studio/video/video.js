var calendar_data
async function videoSetCalendar() {
    let sel_year = $('#sel-year').val()
    console.log("🚀 ~ sel_year:", sel_year)
    let sel_month = $('#sel-month').val()
    console.log("🚀 ~ sel_month:", sel_month)
    console.log("🚀 ~ calendar_data:", calendar_data)
    if (!calendar_data) calendar_data = {}
    if (!calendar_data[sel_year]) calendar_data[sel_year] = {}
    $('#calendar-sec').empty()
    let loaddata = await $.ajax({
        url: script_url,
        type: 'POST',
        data: {
            opt: 'get_calendar_data',
            month: sel_month - 1,
            year: sel_year
        }
    })
    console.log("🚀 ~ loaddata:", loaddata)
    calendar_data[sel_year][sel_month] = loaddata.data
    $.LoadingOverlay('hide')
    let today = new Date()
    let calendar_table = $('<table>', {
        class: 'table table-bordered table-sm',
        id: 'calendar-table'
    })
    let calendar_thead = $('<thead>')
    let calendar_tbody = $('<tbody>')
    calendar_thead.append($('<tr>', { class: 'border-dark' }).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'MO'
    })).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'TU'
    })).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'WE'
    })).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'TH'
    })).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'FR'
    })).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'SA'
    })).append($('<th>', {
        class: 'text-center text-bg-dark border-dark',
        text: 'SU'
    })))
    let firstDay = new Date(sel_year, sel_month - 1, 1)
    let lastDay = new Date(sel_year, sel_month, 0)
    let firstDayWeek = firstDay.getDay() - 1
    if (firstDayWeek == -1) firstDayWeek = 6
    // generate calendar
    let calendar_row = $('<tr>')
    for (let i = 0; i < firstDayWeek; i++) {
        calendar_row.append($('<td>', {
            class: 'text-center'
        }))
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
        let calendar_td = $('<td>', {
            class: 'text-center',
            text: i,
            'data-date': sel_year + '-' + ("00" + sel_month).slice(-2) + '-' + ("00" + i).slice(-2)
        })
        if (i == today.getDate() && sel_month == today.getMonth() + 1 && sel_year == today.getFullYear()) {
            calendar_td.html('<span class="text-danger fw-bold">' + i + '</span>')
        }
        calendar_row.append(calendar_td)
        if (i == lastDay.getDate() && firstDayWeek != 6) {
            for (let j = firstDayWeek + 1; j < 7; j++) {
                calendar_row.append($('<td>', {
                    class: 'text-center'
                }))
            }
        }
        if (firstDayWeek == 6 || i == lastDay.getDate()) {
            calendar_tbody.append(calendar_row)
            calendar_row = $('<tr>')
            firstDayWeek = 0
        } else {
            firstDayWeek++
        }
    }
    calendar_table.append(calendar_tbody)
    calendar_table.append(calendar_thead)
    $('#calendar-sec').empty().append(calendar_table)
    calendar_data[sel_year][sel_month].forEach(r => {
        if (!r[0] || (!r[1] && !r[2] && !r[3]) || (r[1] == 'NO' && r[2] == 'NO' && r[3] == 'NO')) return
        $('#calendar-sec tbody tr td[data-date="' + r[0] + '"]').addClass('bg-dark-subtle')
    })
    $('#calendar-sec tbody tr td').click(function () {
        let date = $(this).attr('data-date')
        let row = $('<div>', { class: 'row container-fluid m-0 p-0 justify-content-center' })
        let btn = ['Portfolio Model', 'Content', 'Note']
        btn.forEach((v, i) => {
            row.append($('<div>', {
                class: 'col-2 text-center',
            }).append($('<i>', {
                class: 'bi bi-circle-fill text-warning'
            })))
            row.append($('<div>', {
                class: 'col-10 btn btn-light text-center mb-2',
                text: v,
                'data-type': i,
                onclick: 'schedule_video_click("' + date + '","' + v.toLowerCase().replace(/ /g, '_') + '")',
            }))
        })
        Swal.fire({
            title: date.split('-')[2] + '/' + date.split('-')[1] + '/' + date.split('-')[0],
            color: '#fff',
            background: '#7b5231',
            html: row.prop('outerHTML'),
            showConfirmButton: false,
        })
    })
    console.log("🚀 ~ calendar_data:", calendar_data)
}
function schedule_video_click(date, type) {
    console.log("🚀 ~ type:", type)
    console.log("🚀 ~ date:", date)
    Swal.close()
    $('#schedule-vdo-sec').fadeOut(150, function () {
        let text_date = date.split('-')
        text_date = text_date[2] + '/' + text_date[1] + '/' + text_date[0]

        switch (type) {
            case 'portfolio_model':
                $('#portfolio-add-update-btn').attr('data-date', date)
                $('#portfolio-sec').fadeIn(150)
                $('#portfolio-date').text('วันที่ ' + text_date)
                let index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(r => r[0] == date)
                clearPortfolioSection()
                if (isAdmin && (index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][index][1] == '')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Portfolio Model ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'เลือก Model',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            showAlertToselectModel()
                        }
                    })
                }
                else if (!isAdmin && (index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][index][1] == '')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Portfolio Model ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'ตกลง',
                        allowOutsideClick: false,
                    }).then((result) => {
                        $('#back-btn').click()
                    })
                }
                else if (index > -1) {
                    if (calendar_data[$('#sel-year').val()][$('#sel-month').val()][index][1] != "") {
                        setPortFolioModel(date, calendar_data[$('#sel-year').val()][$('#sel-month').val()][index][1], false)
                    }
                }
                break;
            case 'content':
                $('#video-content-sec').fadeIn(150)
                $('#video-content-date').text('วันที่ ' + text_date)
                let content_index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(r => r[0] == date)
                clearContentSection()
                if (isAdmin && (content_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][content_index][2] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Content ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'เพิ่ม Content ใหม่',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            showModalToAddUpdateContent(date, 'add')
                            $('#video-content-editor').attr('data-type', 'add')

                        }
                    })
                }
                else if (!isAdmin && (content_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][content_index][2] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Content ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'ตกลง',
                        allowOutsideClick: false,
                    }).then((result) => {
                        $('#back-btn').click()
                    })
                }
                else if(content_index > -1) {
                    if (calendar_data[$('#sel-year').val()][$('#sel-month').val()][content_index][2] != "NO") {
                        $('#video-content-editor').attr('data-date', date)
                        setContentData(date)
                    }
                }
                break;
            case 'note':
                $('#video-note-sec').fadeIn(150)
                $('#video-note-date').text('วันที่ ' + text_date)
                let note_index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(r => r[0] == date)
                clearNoteSection()
                if (isAdmin && (note_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][note_index][3] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Todo list ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'เพิ่ม Todo list ใหม่',
                        confirmButtonColor: '#7b5231',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            showModalToAddUpdateNote(date, 'add')
                            $('#video-note-editor').attr('data-type', 'add')

                        }
                    })
                } 
                else if (!isAdmin && (note_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][note_index][3] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Todo Liat ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'ตกลง',
                        allowOutsideClick: false,
                    }).then((result) => {
                        $('#back-btn').click()
                    })
                } 
                else if(note_index > -1) {
                    if (calendar_data[$('#sel-year').val()][$('#sel-month').val()][note_index][3] != "NO") {
                        $('#video-note-editor').attr('data-date', date)
                        setNoteData(date)
                    }
                }

            default:
                break;
        }
    })
}
document.write('<script src="./video/portfolio.js?' + new Date().getTime() + '"></' + 'script>');
document.write('<script src="./video/content.js?' + new Date().getTime() + '"></' + 'script>');
document.write('<script src="./video/note.js?' + new Date().getTime() + '"></' + 'script>');