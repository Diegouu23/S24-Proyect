document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('formulario');
  const conceptoPago = document.getElementById('conceptoPago');
  const montoPago = document.getElementById('montoPago');
  const formularioPagoUnico = document.getElementById('formularioPagoUnico');
  const radioPago = document.getElementById('radioPago');
  const obra = document.getElementById('obra');
  const gastos = document.getElementById('gastos');
  const total = document.getElementById('total');
  const camposNormales = document.getElementById('camposNormales');

  // Mostrar u ocultar campos según el tipo de transacción
  document.querySelectorAll('input[name="tipo"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radioPago.checked) {
        formularioPagoUnico.style.display = 'block';
        camposNormales.style.display = 'none';
      } else {
        formularioPagoUnico.style.display = 'none';
        camposNormales.style.display = 'block';
        conceptoPago.value = '';
        montoPago.value = '';
      }
      calcularTotal();
    });
  });

  // Calcular el total según tipo
  formulario.addEventListener('input', calcularTotal);

  function calcularTotal() {
    const val1 = radioPago.checked ? (parseFloat(montoPago.value) || 0) : parseFloat(obra.value) || 0;
    const val2 = radioPago.checked ? 0 : parseFloat(gastos.value) || 0;
    total.value = (val1 + val2).toFixed(2);
  }

  // PDF
  let generatedBlob = null;

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { PDFDocument } = PDFLib;

    const rawFecha = document.getElementById('fecha').value;
    const [yyyy, mm, dd] = rawFecha.split("-");
    const fecha = `${dd}/${mm}/${yyyy}`;

    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const obraValor = parseFloat(obra.value) || 0;
    const gastosValor = parseFloat(gastos.value) || 0;
    const montoPagoValor = radioPago.checked ? (parseFloat(montoPago.value) || 0) : 0;
    const totalValor = obraValor + gastosValor + montoPagoValor;

    const obraText = "S/ " + obraValor.toFixed(2);
    const gastosText = "S/ " + gastosValor.toFixed(2);
    const totalText = "S/ " + totalValor.toFixed(2);

    const existingPdfBytes = await fetch('S-24_S.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Rellenar campos comunes
    form.getTextField('Text-Date').setText(fecha);
    form.getTextField('Text-nM4pDb0gMf').setText(totalText);

    if (tipo === "Pago") {
      // Vaciar campos normales
      form.getTextField('Text-ObraM').setText("");
      form.getTextField('Text-GastosC').setText("");

      // Llenar campos de pago
      const concepto = conceptoPago.value.trim();
      const monto = montoPagoValor;
      form.getTextField("Text-gastos").setText(concepto || "");
      form.getTextField("Text-GastosO").setText(!isNaN(monto) ? monto.toFixed(2) : "");
    } else {
      // Llenar campos normales
      form.getTextField('Text-ObraM').setText(obraText);
      form.getTextField('Text-GastosC').setText(gastosText);

      // Vaciar campos de pago
      form.getTextField("Text-gastos").setText("");
      form.getTextField("Text-GastosO").setText("");
    }

    // Checkboxes PDF
    form.getCheckBox('CheckBox-Donacion').uncheck();
    form.getCheckBox('CheckBox-Pago').uncheck();
    form.getCheckBox('CheckBox-S-Efectivo').uncheck();
    form.getCheckBox('CheckBox-Adelanto').uncheck();

    if (tipo === "Donación") form.getCheckBox('CheckBox-Donacion').check();
    if (tipo === "Pago") form.getCheckBox('CheckBox-Pago').check();
    if (tipo === "Depósito") form.getCheckBox('CheckBox-S-Efectivo').check();
    if (tipo === "Adelanto") form.getCheckBox('CheckBox-Adelanto').check();

    form.flatten();

    const pdfBytes = await pdfDoc.save();
    generatedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(generatedBlob);
    link.download = "S-24_generado.pdf";
    link.click();

    document.getElementById('shareBtn').style.display = 'block';
  });

  // Botón para compartir
  const shareBtn = document.createElement('button');
  shareBtn.id = 'shareBtn';
  shareBtn.textContent = 'Compartir por WhatsApp';
  shareBtn.style.display = 'none';
  shareBtn.style.marginTop = '10px';
  document.body.appendChild(shareBtn);

  shareBtn.addEventListener('click', async () => {
    if (!generatedBlob) return alert("Primero genera el PDF.");

    const file = new File([generatedBlob], 'S-24_generado.pdf', { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'S-24 generado',
          text: 'Aquí tienes el formulario S-24 completado.',
          files: [file]
        });
      } catch (error) {
        alert('No se pudo compartir: ' + error.message);
      }
    } else {
      alert('Tu navegador no permite compartir archivos.');
    }
  });
});
