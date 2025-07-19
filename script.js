
const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];

function getRecommendation(inr, bleeding) {
  if (bleeding === "yes") {
    return { percent: 0, text: "ให้ Vitamin K₁ 10 mg IV + FFP และ repeat ทุก 12 ชม.", override: true };
  }
  if (inr < 1.5) return { percent: 0.15, text: "เพิ่มขนาดยา 10–20%" };
  if (inr < 2.0) return { percent: 0.075, text: "เพิ่มขนาดยา 5–10%" };
  if (inr <= 3.0) return { percent: 0, text: "ให้ขนาดยาเท่าเดิม" };
  if (inr <= 3.9) return { percent: -0.075, text: "ลดขนาดยา 5–10%" };
  if (inr <= 4.9) return { percent: -0.10, text: "หยุดยา 1 วัน แล้วลดขนาดยา 10%" };
  if (inr <= 8.9) return { percent: 0, text: "หยุดยา 1–2 วัน และให้ Vitamin K₁ 1 mg oral", override: true };
  return { percent: 0, text: "ให้ Vitamin K₁ 5–10 mg oral", override: true };
}

function findTabletCombo(target) {
  const options = [];
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const total = i * 3 + j * 5;
      const diff = Math.abs(total - target) / target;
      if (total > 0 && diff <= 0.5) {
        options.push({ total, tabs3: i, tabs5: j, diff });
      }
    }
  }
  options.sort((a, b) => a.diff - b.diff);
  return options[0];
}

function renderCircles(tabs3, tabs5) {
  let html = "";
  for (let i = 0; i < Math.floor(tabs3); i++) html += '<span class="circle mg3"></span>';
  if (tabs3 % 1 >= 0.5) html += '<span class="half-circle mg3"></span>';
  for (let i = 0; i < Math.floor(tabs5); i++) html += '<span class="circle mg5"></span>';
  if (tabs5 % 1 >= 0.5) html += '<span class="half-circle mg5"></span>';
  return html;
}

function calculate() {
  const inr = parseFloat(document.getElementById("inr").value);
  const bleeding = document.getElementById("bleeding").value;
  const avg = parseFloat(document.getElementById("avgDose").value);

  if (isNaN(inr) || isNaN(avg)) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  const rec = getRecommendation(inr, bleeding);
  const result = document.getElementById("result");
  if (rec.override) {
    result.innerHTML = `<strong>คำแนะนำ:</strong> ${rec.text}`;
    return;
  }

  const newAvg = avg * (1 + rec.percent);
  const totalWeek = newAvg * 7;

  let html = `
    <strong>คำแนะนำ:</strong> ${rec.text}<br>
    <strong>ขนาดยาต่อสัปดาห์:</strong> ${totalWeek.toFixed(2)} mg<br>
    <strong>ขนาดยาเฉลี่ยต่อวัน:</strong> ${newAvg.toFixed(2)} mg<br><br>
    <table>
      <tr>
        <th>วัน</th><th>ขนาด (mg)</th><th>3 mg</th><th>5 mg</th><th>รวมเม็ด</th><th>แสดงผล</th>
      </tr>`;

  for (let i = 0; i < 7; i++) {
    const combo = findTabletCombo(newAvg);
    const visual = renderCircles(combo.tabs3, combo.tabs5);
    html += `
      <tr>
        <td>${days[i]}</td>
        <td>${combo.total}</td>
        <td>${combo.tabs3}</td>
        <td>${combo.tabs5}</td>
        <td>${combo.tabs3 + combo.tabs5}</td>
        <td>${visual}</td>
      </tr>`;
  }
  html += "</table>";
  result.innerHTML = html;
}
