<script>
  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];

  function calculateTablets(dose) {
    let best = null;
    let minDiff = Infinity;
    for (let i = 0; i <= 4; i++) { // i = จำนวนเม็ด 3 mg
      for (let j = 0; j <= 4; j++) { // j = จำนวนเม็ด 2 mg
        let total = i * 3 + j * 2;
        let diff = Math.abs(dose - total);
        if (diff < minDiff) {
          minDiff = diff;
          best = { tabs3: i, tabs2: j, total };
        }
      }
    }
    return best;
  }

  function distributeDoses(totalWeekly) {
    let targetDaily = totalWeekly / 7;
    let plan = [];
    let withBoth = false;

    for (let i = 0; i < 7; i++) {
      let t = calculateTablets(targetDaily);
      plan.push(t);
      if (t.tabs3 > 0 && t.tabs2 > 0) withBoth = true;
    }

    // ถ้าไม่มีวันไหนมีทั้งเม็ด 2 และ 3 ให้ปรับวันแรกให้มี
    if (!withBoth) {
      let t = calculateTablets(Math.round(targetDaily) + 0.5);
      if (t.tabs3 > 0 && t.tabs2 > 0) plan[0] = t;
    }
    return plan;
  }

  function getAdjustment(inr, bleeding) {
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

  function adjustDose() {
    const inr = parseFloat(document.getElementById("inr").value);
    const bleeding = document.getElementById("bleeding").value;
    const weekly = parseFloat(document.getElementById("weeklyDose").value);

    const resultDiv = document.getElementById("result");
    if (isNaN(inr) || isNaN(weekly)) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const adj = getAdjustment(inr, bleeding);
    if (adj.override) {
      resultDiv.innerHTML = `<strong>คำแนะนำ:</strong> ${adj.text}`;
      return;
    }

    const newWeekly = weekly * (1 + adj.percent);
    const plan = distributeDoses(newWeekly);

    let html = `<strong>คำแนะนำ:</strong> ${adj.text}<br><strong>ขนาดใหม่:</strong> ${newWeekly.toFixed(2)} mg/สัปดาห์<br><br>`;
    html += `<table><tr><th>วัน</th><th>ขนาดยา (mg)</th><th>เม็ด</th></tr>`;
    for (let i = 0; i < 7; i++) {
      const t = plan[i];
      const pillHTML = `
        <div class="circles">
          ${'●'.repeat(t.tabs3).replace(/●/g, '<span class="circle blue"></span>')}
          ${'●'.repeat(t.tabs2).replace(/●/g, '<span class="circle pink"></span>')}
        </div>
      `;
      html += `<tr><td>${days[i]}</td><td>${t.total} mg</td><td>${pillHTML}</td></tr>`;
    }
    html += `</table>`;
    resultDiv.innerHTML = html;
  }
</script>
