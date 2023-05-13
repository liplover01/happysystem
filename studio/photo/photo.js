async function photoSetCalendar() {
    let sel_year = $('#photo-sel-year').val()
    console.log("🚀 ~ sel_year:", sel_year)
    let sel_month = $('#photo-sel-month').val()
    console.log("🚀 ~ sel_month:", sel_month)
    console.log("🚀 ~ calendar_data:", calendar_data)
    if (!calendar_data) calendar_data = {}
    if (!calendar_data[sel_year]) calendar_data[sel_year] = {}
    $('#photo-calendar-sec').empty()
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
    $('#photo-calendar-sec').empty().append(calendar_table)
    calendar_data[sel_year][sel_month].forEach(r => {
        if (!r[0] || (!r[4] && !r[5]) || (r[4] == 'NO' && r[5] == 'NO')) return
        $('#photo-calendar-sec tbody tr td[data-date="' + r[0] + '"]').addClass('bg-dark-subtle')
    })
    $('#photo-calendar-sec tbody tr td').click(function () {
        let date = $(this).attr('data-date')
        let row = $('<div>', { class: 'row container-fluid m-0 p-0 justify-content-center' })
        let btn = ['Reference', 'File Photo']
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
                onclick: 'schedule_photo_click("' + date + '","' + v.toLowerCase().replace(/ /g, '_') + '")',
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

function schedule_photo_click(date, type) {
    console.log("🚀 ~ type:", type)
    console.log("🚀 ~ date:", date)
    Swal.close()
    $('#schedule-photo-sec').fadeOut(150, function () {
        let text_date = date.split('-')
        text_date = text_date[2] + '/' + text_date[1] + '/' + text_date[0]
        switch (type) {
            case 'reference':
                $('#photo-reference-sec').fadeIn(150)

                $('#photo-reference-date').text('วันที่ ' + text_date)
                clearReferenceSection()
                let reference_index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(r => r[0] == date)
                if (isAdmin && (reference_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][reference_index][4] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Reference ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'เพิ่ม Reference ใหม่',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            showModalToAddUpdateReference(date, 'add')
                            $('#photo-reference-modal-div').attr('data-type', 'add')

                        }
                    })
                }
                else if (!isAdmin && (reference_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][reference_index][4] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูล Reference ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'ตกลง',
                        allowOutsideClick: false,
                    }).then((result) => {
                        $('#back-btn').click()
                    })
                }
                else if (reference_index >= 0) {
                    if (calendar_data[$('#sel-year').val()][$('#sel-month').val()][reference_index][4] != "NO") {
                        $('#photo-reference-modal-div').attr('data-date', date)
                        setReferenceData(date)
                    }
                }
                break;
            case 'file_photo':
                $('#photo-file-photo-sec').fadeIn(150)

                $('#photo-file-photo-date').text('วันที่ ' + text_date)
                clearFilePhotoSection()
                let file_photo_index = calendar_data[$('#sel-year').val()][$('#sel-month').val()].findIndex(r => r[0] == date)
                if (isAdmin && (file_photo_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][file_photo_index][5] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูลไฟล์ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'เพิ่มไฟล์ใหม่',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            showModalToAddUpdateFilePhoto(date, 'add')
                            $('#photo-file-photo-modal-div').attr('data-type', 'add')

                        }
                    })
                }
                else if (!isAdmin && (file_photo_index < 0 || calendar_data[$('#sel-year').val()][$('#sel-month').val()][file_photo_index][5] == 'NO')) {
                    Swal.fire({
                        icon: 'info',
                        html: '<h2>ยังไม่มีการบันทึกข้อมูลไฟล์ในวันที่คุณเลือก<h2>',
                        confirmButtonText: 'ตกลง',
                        allowOutsideClick: false,
                    }).then((result) => {
                        $('#back-btn').click()
                    })
                }
                else if (file_photo_index >= 0) {
                    if (calendar_data[$('#sel-year').val()][$('#sel-month').val()][file_photo_index][4] != "NO") {
                        $('#photo-file-photo-modal-div').attr('data-date', date)
                        setFilePhotoData(date)
                    }
                }
                break;

            default:
                break;
        }
    })
}

document.write('<script src="./photo/reference.js?' + new Date().getTime() + '"></' + 'script>');
document.write('<script src="./photo/file_photo.js?' + new Date().getTime() + '"></' + 'script>');