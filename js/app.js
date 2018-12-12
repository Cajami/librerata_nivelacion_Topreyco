var emailLogin = '';
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBxo5YfWvqPinJBVs3bR8Z7Hrh-Nz7L2Bg",
    authDomain: "libreta-nivelacion-topreyco.firebaseapp.com",
    databaseURL: "https://libreta-nivelacion-topreyco.firebaseio.com",
    projectId: "libreta-nivelacion-topreyco",
    storageBucket: "",
    messagingSenderId: "516163254379"
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        emailLogin = user.email.split('@')[0];
        
        $('#login').addClass('d-none');
        $('#txtEmail,#txtPassword').val('');
        $('#contenedorApp').removeClass('d-none');
        readData();

    } else {
        emailLogin = '';

        $('#btnLimpiar').trigger('click');

        // No user is signed in.
        $('#login').removeClass('d-none');
        $('#contenedorApp').addClass('d-none');

    }
});

function readData() {
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref(emailLogin + '/libreta').once('value').then(function (snapshot) {
        var data = snapshot.val();
        var $tabla = $('#tablaLibreta tbody');

        $.each(data, function (i, index) {
            if (i == 0) {
                $tabla.find('tr:eq(' + i + ') td:eq(1) input').val(index.hito);
                $tabla.find('tr:eq(' + i + ') td:eq(2) input').val(index.ptoVisado);
                $tabla.find('tr:eq(' + i + ') td:eq(3) input').val(index.vAtras);
                $tabla.find('tr:eq(' + i + ') td:eq(4) input').val(index.vInt);
                $tabla.find('tr:eq(' + i + ') td:eq(5) input').val(index.vAdel);
                $tabla.find('tr:eq(' + i + ') td:eq(6)').text(index.altInst);
                $tabla.find('tr:eq(' + i + ') td:eq(7) input').val(index.cota);
            } else
                $('#btnAgregar').trigger('click', [index]);
            //$tabla.find('tr:eq(' + i + ') td:eq(7)').text(index.cota);
        });
    });
}

$('#btnIngresar').on('click', function () {
    var email = $('#txtEmail').val().trim();
    var password = $('#txtPassword').val().trim();
    firebase.auth().signInWithEmailAndPassword(email, password)
        // .then(function () {
        //     readData();
        // })
        .catch(function (error) {
            // Handle Errors here.
            // var errorCode = error.code;
            // var errorMessage = error.message;
            alert('Email y/o Password incorrectos');
            // ...
        });
});

$('#btnCerrarSesion').on('click', function () {
    firebase.auth().signOut().catch(function (error) {
        alert('Error!!!');
    });
});


if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    $('*').css('font-size', '10px');
    $('#btnExportarExcel').remove();
    // Do something
    // } else {
    //     // Do something else
}


$('#btnAgregar').on('click', function (event, data) {
    console.log(data);
    var hito = data.hito ? data.hito : '',
        ptoVisado = data.ptoVisado ? data.ptoVisado : '',
        vAtras = data.vAtras ? data.vAtras : '',
        vInt = data.vInt ? data.vInt : '',
        vAdel = data.vAdel ? data.vAdel : '',
        altInst = data.altInst ? data.altInst : '',
        cota = data.cota ? data.cota : '';

    $('#tablaLibreta').append('<tr>' +
        '<td class="text-center"><i class="far fa-trash-alt text-danger eliminarRegistro"></i></td>' +
        '<td>' +
        '<input type="text" class="form-control" value="' + hito + '">' +
        '</td>' +
        '<td>' +
        '<input type="text" class="form-control" value="' + ptoVisado + '">' +
        '</td>' +
        '<td>' +
        '<input type="text" class="form-control" value="' + vAtras + '">' +
        '</td>' +
        '<td>' +
        '<input type="text" class="form-control" value="' + vInt + '">' +
        '</td>' +
        '<td>' +
        '<input type="text" class="form-control" value="' + vAdel + '">' +
        '</td>' +
        '<td class="text-center">' + altInst +
        '</td>' +
        '<td class="text-center">' + cota +
        '</td>' +
        '</tr>');
});

$('#btnCalcular').on('click', function () {
    var ALT_INST = 'ALT-INST';
    var hito, ptoVisado, vInt, vAdel;
    var vAtras = 0;
    var cota = 0;
    var cota_anterior = 0;

    var saveData = [];

    $('#tablaLibreta tbody tr').each(function (index, elemento) {
        vAtras = $(elemento).find('td:eq(3) input').val().trim();

        if (vAtras.length == 0 || vAtras == 0) {
            //PRIMERO ALT_INST Y DESPUES COTA
            $(elemento).find('td:eq(6)').text(ALT_INST);

            if (index > 0) {
                vInt = $(elemento).find('td:eq(4) input').val().trim();
                if (vInt.length == 0 || vInt == 0) {
                    vAdel = $(elemento).find('td:eq(5) input').val().trim();

                    cota = parseFloat(ALT_INST) - parseFloat(vAdel);
                } else {
                    cota = parseFloat(ALT_INST) - parseFloat(vInt);
                }
                cota = parseFloat(parseFloat(cota).toFixed(3));
            }

        } else {
            //PRIMERO COTA Y DESPUES ALT_INST

            if (index > 0) {
                vAdel = $(elemento).find('td:eq(5) input').val().trim();
                if (vAdel.length == 0 || vAdel == 0) {
                    cota = parseFloat(cota_anterior);
                } else {
                    cota = parseFloat(ALT_INST) - parseFloat(vAdel);
                }
            } else {
                cota = parseFloat($(elemento).find('td:eq(7) input').val().trim());
            }
            cota = parseFloat(parseFloat(cota).toFixed(3));

            ALT_INST = parseFloat(parseFloat(parseFloat(vAtras) + cota).toFixed(3));
            $(elemento).find('td:eq(6)').text(ALT_INST);
        }

        if (index > 0)
            $(elemento).find('td:eq(7)').text(cota);

        cota_anterior = cota;


        saveData.push({
            hito: $(elemento).find('td:eq(1) input').val().trim(),
            ptoVisado: $(elemento).find('td:eq(2) input').val().trim(),
            vAtras: $(elemento).find('td:eq(3) input').val().trim(),
            vInt: $(elemento).find('td:eq(4) input').val().trim(),
            vAdel: $(elemento).find('td:eq(5) input').val().trim(),
            altInst: $(elemento).find('td:eq(6)').text().trim(),
            cota: index == 0 ? $(elemento).find('td:eq(7) input').val().trim() : $(elemento).find('td:eq(7)').val().trim()
        });
    });

    firebase.database().ref(emailLogin + '/libreta').set(saveData);
});

$('#tablaLibreta tbody').on('click', 'i.eliminarRegistro', function () {
    $(this).closest('tr').remove();
});

$('#btnLimpiar').on('click', function () {
    var $tabla = $('#tablaLibreta tbody');
    $tabla.find('tr:not(:first)').remove();
    var $tr = $tabla.find('tr');
    $tr.find('td:eq(1) input').val('');
    $tr.find('td:eq(2) input').val('');
    $tr.find('td:eq(3) input').val('');
    $tr.find('td:eq(4) input').val('');
    $tr.find('td:eq(5) input').val('');
    $tr.find('td:eq(6)').text('');
    $tr.find('td:eq(7) input').val('');

    firebase.database().ref(emailLogin + '/libreta').set({});
});

$('#btnExportarExcel').on('click', function () {
    var dataExportar = '<table border="2px">' +
        '<tr>' +
        '<td bgcolor="#87AFC6">HITO</td>' +
        '<td bgcolor="#87AFC6">PTO-VISADO</td>' +
        '<td bgcolor="#87AFC6">V-ATRAS</td>' +
        '<td bgcolor="#87AFC6">V-INT</td>' +
        '<td bgcolor="#87AFC6">V-ADEL</td>' +
        '<td bgcolor="#87AFC6">ALT-INST</td>' +
        '<td bgcolor="#87AFC6">COTA</td>' +
        '</tr>';

    var cota = '';

    $('#tablaLibreta tbody tr').each(function (index, elemento) {

        if (index == 0)
            cota = $(elemento).find('td:eq(7) input').val().trim();
        else
            cota = $(elemento).find('td:eq(7)').text().trim();

        dataExportar += '<tr>' +
            '<td>' + $(elemento).find('td:eq(1) input').val().trim() + '</td>' +
            '<td>' + $(elemento).find('td:eq(2) input').val().trim() + '</td>' +
            '<td>' + $(elemento).find('td:eq(3) input').val().trim() + '</td>' +
            '<td>' + $(elemento).find('td:eq(4) input').val().trim() + '</td>' +
            '<td>' + $(elemento).find('td:eq(5) input').val().trim() + '</td>' +
            '<td>' + $(elemento).find('td:eq(6)').text().trim() + '</td>' +
            '<td>' + cota + '</td>' +
            '</tr>';
    });
    dataExportar += '</table>';
    fnExcelReport(dataExportar);
});

function fnExcelReport(tab_text) {
    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    {
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand("SaveAs", true, "Say Thanks to Sumit.xls");
    }
    else                 //other browser not tested on IE 11
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));

    return (sa);
}
