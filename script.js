document.getElementById('formulario').addEventListener('input', () => {
  const obra = parseFloat(document.getElementById('obra').value) || 0;
  const gastos = parseFloat(document.getElementById('gastos').value) || 0;
  document.getElementById('total').value = (obra + gastos).toFixed(2);
});

let generatedBlob = null;

document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { PDFDocument } = PDFLib;

  const rawFecha = document.getElementById('fecha').value;
  //cambia la fecha en orden comun
  const [yyyy, mm, dd] = rawFecha.split("-");
  const fecha = `${dd}/${mm}/${yyyy}`;

  const tipo = document.querySelector('input[name="tipo"]:checked').value;
  const obra = parseFloat(document.getElementById('obra').value) || 0;
  const gastos = parseFloat(document.getElementById('gastos').value) || 0;
  const total = obra + gastos;

  const obraText = "S/ " + obra.toFixed(2);
  const gastosText = "S/ " + gastos.toFixed(2);
  const totalText = "S/ " + total.toFixed(2);

  const existingPdfBytes = await fetch('S-24_S.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  // Rellenar campos de texto
  form.getTextField('Text-Date').setText(fecha);
  form.getTextField('Text-ObraM').setText(obraText);
  form.getTextField('Text-GastosC').setText(gastosText);
  form.getTextField('Text-nM4pDb0gMf').setText(totalText);

  // Desmarcar todos los checkbox
  form.getCheckBox('CheckBox-Donacion').uncheck();
  form.getCheckBox('CheckBox-Pago').uncheck();
  form.getCheckBox('CheckBox-S-Efectivo').uncheck();
  form.getCheckBox('CheckBox-Adelanto').uncheck();

  // Marcar solo el seleccionado
  if (tipo === "Donación") form.getCheckBox('CheckBox-Donacion').check();
  if (tipo === "Pago") form.getCheckBox('CheckBox-Pago').check();
  if (tipo === "Depósito") form.getCheckBox('CheckBox-S-Efectivo').check();
  if (tipo === "Adelanto") form.getCheckBox('CheckBox-Adelanto').check();

  // Asegurar que los datos queden visibles
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  generatedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(generatedBlob);
  link.download = "S-24_generado.pdf";
  link.click();

  document.getElementById('shareBtn').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.createElement('button');
  shareBtn.id = 'shareBtn';
  shareBtn.textContent = 'Compartir por WhatsApp';
  shareBtn.style.display = 'none';
  shareBtn.style.marginTop = '10px';
  document.body.appendChild(shareBtn);

  shareBtn.addEventListener('click', async () => {
    if (navigator.canShare && navigator.canShare({ files: [new File([generatedBlob], 'S-24_generado.pdf', { type: 'application/pdf' })] })) {
      try {
        await navigator.share({
          title: 'S-24 generado',
          text: 'Aquí tienes el formulario S-24 completado.',
          files: [new File([generatedBlob], 'S-24_generado.pdf', { type: 'application/pdf' })]
        });
      } catch (error) {
        alert('No se pudo compartir: ' + error);
      }
    } else {
      alert('Tu navegador no permite compartir archivos. Usa la opción de descarga manual.');
    }
  });
});
