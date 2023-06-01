$(document).ready(() => {
    $('#onair-add-btn').click(function () {
        let date = $('#onair-modal-div').attr('data-date')
        let type = 'add'

        $('#onair-modal-div input').val('')
        $('#onair-modal-div input[type=checkbox]').prop('checked', false)

        showModalToAddUpdateOnair(date, type)
    })
    $('#onAirModalBtn').click(function () {
        let type = $('#onair-modal-div').attr('data-type')
        console.log("🚀 ~ type:", type)
        let date = $('#onair-modal-div').attr('data-date')
        if (type == 'add') {
            console.log('add');
            onAirAddData(date)
        } else {
            console.log('update');
            onAirUpdateData(date)
        }
    })
})

async function onairSetCalendar(isupdate) {
    console.log("🚀 ~ onairSetCalendar ~ isupdate:", isupdate)
    let sel_year = $('#onair-sel-year').val()
    console.log("🚀 ~ sel_year:", sel_year)
    let sel_month = $('#onair-sel-month').val()
    console.log("🚀 ~ sel_month:", sel_month)
    console.log("🚀 ~ calendar_data:", calendar_data)
    if (!calendar_data) calendar_data = {}
    if (!calendar_data[sel_year]) calendar_data[sel_year] = {}
    $('#onair-calendar-sec').empty()
    if (!isupdate) {
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
    }
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
    $('#onair-calendar-sec').empty().append(calendar_table)
    calendar_data[sel_year][sel_month].forEach(r => {
        if (!r[0] || !r[6] || r[6] == 'NO') return
        $('#onair-calendar-sec tbody tr td[data-date="' + r[0] + '"]').addClass('bg-dark-subtle')
    })
    $('#onair-calendar-sec tbody tr td').click(function () {
        let date = $(this).attr('data-date')
        let row = $('<div>', { class: 'row container-fluid m-0 p-0 justify-content-center' })
        schedule_onair_click(date)
    })
    console.log("🚀 ~ calendar_data:", calendar_data)
}

function schedule_onair_click(date) {
    console.log("🚀 ~ date:", date)
    $('#schedule-onair-sec').fadeOut(150, function () {
        $('#onair-data-sec').fadeIn(150)
        let text_date = date.split('-')
        text_date = text_date[2] + '/' + text_date[1] + '/' + text_date[0]

        $('#onair-date').text('วันที่ ' + text_date)
        $('#onair-tbody').empty()
        let onair_index = calendar_data[$('#sel-year').val()][$('#onair-sel-month').val()].findIndex(r => r[0] == date)
        if (isAdmin && (onair_index < 0 || calendar_data[$('#onair-sel-year').val()][$('#onair-sel-month').val()][onair_index][6] == 'NO')) {
            // clearReferenceSection()
            Swal.fire({
                icon: 'info',
                html: '<h2>ยังไม่มีการบันทึกข้อมูลรายการ On Air ในวันที่คุณเลือก<h2>',
                confirmButtonText: 'เพิ่มรายการ On Air ใหม่',
            }).then((result) => {
                if (result.isConfirmed) {
                    showModalToAddUpdateOnair(date, 'add')
                    $('#onair-reference-modal-div').attr('data-type', 'add')

                }
            })
        }
        else if (!isAdmin && (onair_index < 0 || calendar_data[$('#onair-sel-year').val()][$('#onair-sel-month').val()][onair_index][6] == 'NO')) {
            // clearReferenceSection()
            Swal.fire({
                icon: 'info',
                html: '<h2>ยังไม่มีการบันทึกข้อมูลรายการ On Air ในวันที่คุณเลือก<h2>',
                confirmButtonText: 'ตกลง',
                allowOutsideClick: false,
            }).then((result) => {
                $('#back-btn').click()
            })
        }
        else if (onair_index >= 0) {
            if (calendar_data[$('#onair-sel-year').val()][$('#onair-sel-month').val()][onair_index][6] != "NO") {
                $('#onair-modal-div').attr('data-date', date)
                getOnAirData(date)
            }
        }
    })
}

function showModalToAddUpdateOnair(date, type, id) {
    $('#onair-modal-div').find('input').val('')
    // clear checkbox
    $('#onair-modal-div').find('input[type="checkbox"]').prop('checked', false)
    console.log('showmodal')
    console.log("🚀 ~ date:", date)
    $('#onair-modal-div').attr('data-type', type)
    $('#onair-modal-div').attr('data-date', date)
    let title
    if (type == 'add') {
        title = 'เพิ่มรายการ On Air'
    } else {
        title = 'แก้ไขรายการ On Air'
        $('#onair-modal-div').attr('data-id', id)
        fillOnairDataToUpdate(date, id)
    }

    $('#onAirModal').modal('show')
    $('#onAirModalLabel').text(title)
    console.log(onair_date)
}



function clearOnairSection() {
    // $('#photo-reference-sec').find('.reference-div').not('.reference-template').remove()
}

function onAirAddData(date) {
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังเพิ่มรายการ On Air ใหม่<h2>',
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
            opt: 'add_onair_data',
            date: date,
            channel_name: $('#onair-channel-name').val(),
            clip_name: $('#onair-clip-name').val(),
            youtube: $('#onair-youtube-check').is(':checked'),
            facebook: $('#onair-facebook-check').is(':checked'),
            instagram: $('#onair-instagram-check').is(':checked'),
            tiktok: $('#onair-tiktok-check').is(':checked'),
        },
        success: function (res) {
            console.log("🚀 ~ res:", res);
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มรายการ On Air สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#onAirModal').modal('hide')
                    if (!onair_date[date]) onair_date[date] = []
                    if (res.data) {
                        onair_date[date].push({ id: res.id, channel_name: res.data.channel_name, clip_name: res.data.clip_name, youtube: res.data.youtube, facebook: res.data.facebook, instagram: res.data.instagram, tiktok: res.data.tiktok })
                    }
                    console.log("🚀 ~ onair_date:", onair_date)
                    let year = date.split('-')[0]
                    console.log("🚀 ~ onAirAddData ~ year:", year)
                    let month = Number(date.split('-')[1])
                    console.log("🚀 ~ onAirAddData ~ month:", month)
                    let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                    console.log("🚀 ~ onAirAddData ~ calendar_index:", calendar_index)
                    if (calendar_index > -1) {
                        calendar_data[year][month][calendar_index][6] = "YES"
                    } else {
                        calendar_data[year][month].push([date, 'NO', 'NO', 'NO', 'NO', 'NO', 'YES'])
                    }
                    onairSetCalendar(true)
                    appendOnairData(date)
                })
            }
        }
    })




}

function onAirUpdateData(date) {
    Swal.fire({
        icon: 'info',
        html: '<h2>กำลังแก้ไขรายการ On Air<h2>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    let id = $('#onair-modal-div').attr('data-id')
    console.log("🚀 ~ id:", id)
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'update_onair_data',
            date: date,
            id: id,
            channel_name: $('#onair-channel-name').val(),
            clip_name: $('#onair-clip-name').val(),
            youtube: $('#onair-youtube-check').is(':checked'),
            facebook: $('#onair-facebook-check').is(':checked'),
            instagram: $('#onair-instagram-check').is(':checked'),
            tiktok: $('#onair-tiktok-check').is(':checked'),
        },
        success: function (res) {
            console.log("🚀 ~ res:", res);
            console.log("🚀 ~ res:", res)
            if (res.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'แก้ไขรายการ On Air สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#onAirModal').modal('hide')
                    if (!onair_date[date]) onair_date[date] = []
                    let index = onair_date[date].findIndex((data) => data.id == id)
                    if (index != -1) {
                        onair_date[date][index].channel_name = res.data.channel_name
                        onair_date[date][index].clip_name = res.data.clip_name
                        onair_date[date][index].youtube = res.data.youtube
                        onair_date[date][index].facebook = res.data.facebook
                        onair_date[date][index].instagram = res.data.instagram
                        onair_date[date][index].tiktok = res.data.tiktok
                    }
                    console.log("🚀 ~ onair_date:", onair_date)

                    appendOnairData(date)
                })
            }
        }
    })








}

var onair_date = {}
function getOnAirData(date) {
    $.LoadingOverlay("show");
    $.ajax({
        method: 'POST',
        url: script_url,
        data: {
            opt: 'get_onair_data',
            date: date,
        },
        success: function (res) {
            if (res.status == 'success') {
                $.LoadingOverlay("hide");
                if (res.data) {
                    onair_date[date] = res.data
                    appendOnairData(date)
                }
            }
        }
    })
}


function appendOnairData(date) {

    console.log("🚀 ~ onair_date:", onair_date)
    let tbody = $('<tbody>')
    onair_date[date].forEach((data, index) => {
        console.log("🚀 ~ data:", data)
        let tr = $('<tr>')
        tr.append($('<td>', { style: "max-width: 250px; min-width: 100px", class: "text-break" }).text(data.channel_name))
        tr.append($('<td>', { style: "max-width: 250px; min-width: 100px", class: "text-break" }).text(data.clip_name))
        tr.append($('<td>', { style: 'min-width: 22px', class: 'text-center' }).text(data.youtube.toUpperCase() == 'TRUE' ? '✅' : ''))
        tr.append($('<td>', { style: 'min-width: 22px', class: 'text-center' }).text(data.facebook.toUpperCase() == 'TRUE' ? '✅' : ''))
        tr.append($('<td>', { style: 'min-width: 22px', class: 'text-center' }).text(data.instagram.toUpperCase() == 'TRUE' ? '✅' : ''))
        tr.append($('<td>', { style: 'min-width: 22px', class: 'text-center' }).text(data.tiktok.toUpperCase() == 'TRUE' ? '✅' : ''))
        if (isAdmin) {
            tr.append($('<td>', { style: 'min-width: 22px', class: 'text-center' }).append($('<button>', { class: 'btn btn-sm btn-warning', onclick: `showModalToAddUpdateOnair('${date}','update', '${data.id}')` }).html('<i class="bi bi-pencil"></i>')))
            tr.append($('<td>', { class: 'text-center' }).append($('<button>', { class: 'btn btn-sm btn-secondary', onclick: `onAirDeleteData('${date}', '${data.id}')` }).html('<i class="bi bi-trash"></i>')))
        }
        tbody.append(tr)

    })
    $('#onair-tbody').empty().replaceWith(tbody)
    tbody.attr('id', 'onair-tbody')

}

function fillOnairDataToUpdate(date, id) {
    console.log("🚀 ~ id:", id)
    console.log("🚀 ~ date:", date)
    let data = onair_date[date].find((data) => {
        return data.id == id
    })
    $('#onair-channel-name').val(data.channel_name)
    $('#onair-clip-name').val(data.clip_name)
    $('#onair-youtube-check').prop('checked', data.youtube == 'TRUE')
    $('#onair-facebook-check').prop('checked', data.facebook == 'TRUE')
    $('#onair-instagram-check').prop('checked', data.instagram == 'TRUE')
    $('#onair-tiktok-check').prop('checked', data.tiktok == 'TRUE')
}

function onAirDeleteData(date, id) {
    Swal.fire({
        title: 'คุณต้องการลบรายการนี้ใช่หรือไม่',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `ลบ`,
        denyButtonText: `ยกเลิก`,
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'กำลังลบรายการ On Air',
                didOpen: () => {
                    Swal.showLoading()
                }
            })
            $.ajax({
                method: 'POST',
                url: script_url,
                data: {
                    opt: 'delete_onair_data',
                    id: id,
                },
                success: function (res) {
                    Swal.close()
                    if (res.status == 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบรายการ On Air สำเร็จ',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            let index = onair_date[date].findIndex((data) => data.id == id)
                            if (index != -1) {
                                onair_date[date].splice(index, 1)
                            }
                            if (onair_date[date].length == 0) {
                                let year = date.split('-')[0]
                                let month = Number(date.split('-')[1])
                                let calendar_index = calendar_data[year][month].findIndex(a => a[0] == date)
                                if (calendar_index > -1) {
                                    calendar_data[year][month][calendar_index][6] = "NO"
                                }
                            }
                            appendOnairData(date)
                        })
                    }
                }
            })
        }
    })
}





