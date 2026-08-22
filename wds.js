/* W.D.S — medição de conversão + demonstração ao vivo. Sem dependências. */
(function () {
  'use strict';

  /* ---------- 1. Medição ----------
     Instale UM provedor no <head> das páginas (escolha um):
       Plausible: <script defer data-domain="SEUDOMINIO" src="https://plausible.io/js/script.js"></script>
       GA4:       <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script> + gtag init
     O track() abaixo entrega o evento para quem estiver instalado — e não quebra se nenhum estiver. */
  function track(name, props) {
    props = props || {};
    try { if (window.plausible) window.plausible(name, { props: props }); } catch (e) {}
    try { if (window.gtag) window.gtag('event', name, props); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, props)); } catch (e) {}
  }
  window.wdsTrack = track;

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-track]');
    if (!el) return;
    track(el.getAttribute('data-track'), {
      produto: el.getAttribute('data-produto') || '',
      local: el.getAttribute('data-local') || '',
      preco: el.getAttribute('data-preco') || ''
    });
  });

  /* Profundidade de rolagem: mostra se a página perde o visitante antes do preço. */
  var marks = [25, 50, 75, 100], hit = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight * 100;
    marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = 1; track('scroll_' + m); } });
  }, { passive: true });

  /* ---------- 2. Demonstração ao vivo (substitui o print até haver imagens) ---------- */
  var demo = document.getElementById('demo');
  if (!demo) return;

  var $ = function (id) { return document.getElementById(id); };
  var brl = function (n) { return 'R$ ' + n.toFixed(2).replace('.', ','); };
  var usou = false;

  function calc() {
    var custo = parseFloat(($('d-custo').value || '0').replace(',', '.')) || 0;
    var margem = parseFloat($('d-margem').value) || 0;
    var canal = parseFloat($('d-canal').value) || 0;
    var imposto = parseFloat($('d-imposto').value) || 0;

    var deducoes = (margem + canal + imposto) / 100;
    var out = $('d-preco'), nota = $('d-nota'), sem = $('d-semaforo'), lucroEl = $('d-lucro');

    if (custo <= 0) {
      out.textContent = '—';
      lucroEl.textContent = '—';
      sem.style.background = '#3f424d';
      nota.textContent = 'Digite o custo dos ingredientes do prato.';
      nota.style.color = '#a2a7bd';
      return;
    }
    if (deducoes >= 0.95) {
      out.textContent = 'inviável';
      lucroEl.textContent = '—';
      sem.style.background = '#e06c75';
      nota.textContent = 'Margem + comissão + imposto passam de 95%: nenhum preço fecha. A planilha aponta isso antes de você errar o cardápio.';
      nota.style.color = '#ffb3b3';
      return;
    }

    var preco = custo / (1 - deducoes);
    var lucro = preco * (margem / 100);
    out.textContent = brl(preco);
    lucroEl.textContent = brl(lucro);

    if (margem >= 25 && canal <= 25) { sem.style.background = '#8fe3ae'; nota.textContent = 'Verde: margem saudável para o canal escolhido.'; nota.style.color = '#a8e8c0'; }
    else if (margem >= 12) { sem.style.background = '#f3d778'; nota.textContent = 'Amarelo: fecha, mas sobra pouco. Revise porção ou fornecedor.'; nota.style.color = '#f5e2a8'; }
    else { sem.style.background = '#e06c75'; nota.textContent = 'Vermelho: nesse preço o prato quase não paga o próprio custo.'; nota.style.color = '#ffb3b3'; }

    if (!usou) { usou = true; track('demo_usada'); }
  }

  demo.addEventListener('input', calc);
  demo.addEventListener('change', calc);
  calc();
})();
