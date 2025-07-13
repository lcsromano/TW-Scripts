// Mass Scavenging por Sophie "Shinko to Kuma" - Versão Melhorada
// Melhorias: Removidas redundâncias, corrigidos erros de digitação, otimizado o código para melhor legibilidade e eficiência.
// Removidas partes desnecessárias como temas de cores não utilizados, logs excessivos e código comentado obsoleto.

const serverTimeTemp = $("#serverDate")[0].innerText + " " + $("#serverTime")[0].innerText;
const serverTimeMatch = serverTimeTemp.match(/^([0][1-9]|[12][0-9]|3[01])[\/\-]([0][1-9]|1[012])[\/\-](\d{4})( (0?[0-9]|[1][0-9]|[2][0-3])[:]([0-5][0-9])([:]([0-5][0-9]))?)?$/);
const serverDate = Date.parse(serverTimeMatch[3] + "/" + serverTimeMatch[2] + "/" + serverTimeMatch[1] + serverTimeMatch[4]);
const isMobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig);

let scavengeInfo;
let tempElementSelection = "";

// Redireciona para a página de scavenging em massa se necessário
if (window.location.href.indexOf('screen=place&mode=scavenge_mass') < 0) {
    window.location.assign(game_data.link_base_pure + "place&mode=scavenge_mass");
}

// Remove UI existente se houver
$("#massScavengeSophie").remove();

// Define variáveis globais
let version = localStorage.getItem("version") || "new";

// Traduções otimizadas (apenas as necessárias)
let langShinko = [
    "Scavenging em Massa",
    "Selecione tipos de unidades/ORDENAR para scavenging (arraste para ordenar)",
    "Selecione categorias para usar",
    "Quando você quer que as runs de scavenging retornem (aproximadamente)?",
    "Duração aqui",
    "Calcular durações para cada página",
    "Criador: ",
    "Scavenging em massa: enviar por 50 aldeias",
    "Lançar grupo "
];

switch (game_data.locale) {
    case "ro_RO":
        langShinko = [
            "Curatare in masa",
            "Selecteaza tipul unitatii/ORDONEAZA sa curete cu (trage unitatea pentru a ordona)",
            "Selecteaza categoria",
            "Cand vrei sa se intoarca trupele de la curatare (aproximativ)",
            "Durata aici",
            "Calculeaza durata pentru fiecare pagina",
            "Creator: ",
            "Cueatare in masa: trimite pe 50 de sate",
            "Lanseaza grup "
        ];
        break;
    case "ar_AE":
        langShinko = [
            "الاغارات",
            "اختر الوحدات المستخدمة فى الاغارات",
            "اختر انوا ع الاغارات المستخدمة ",
            " ما المدة الزمنية المراد ارسال الاغارات بها",
            "ضع المدة هنا",
            "حساب المدة لكل صفحة ",
            "Creator: ",
            "الاغارات : ترسل لكل 50 قرية على حدى ",
            " تشغيل المجموعة "
        ];
        break;
    case "el_GR":
        langShinko = [
            "Μαζική σάρωση",
            "Επιλέξτε τις μονάδες με τις οποίες θα κάνετε σάρωση",
            "Επιλέξτε επίπεδα σάρωσης που θα χρησιμοποιηθούν",
            "Χρόνος Σάρωσης (Ώρες.Λεπτά)",
            "Χρόνος",
            "Υπολόγισε χρόνους σάρωσης για κάθε σελίδα.",
            "Δημιουργός: ",
            "Μαζική σάρωση: Αποστολή ανά 50 χωριά",
            "Αποστολή ομάδας "
        ];
        break;
    case "nl_NL":
        langShinko = [
            "Massa rooftochten",
            "Kies welke troeptypes je wil mee roven, sleep om prioriteit te ordenen",
            "Kies categorieën die je wil gebruiken",
            "Wanneer wil je dat je rooftochten terug zijn?",
            "Looptijd hier invullen",
            "Bereken rooftochten voor iedere pagina",
            "Scripter: ",
            "Massa rooftochten: verstuur per 50 dorpen",
            "Verstuur groep "
        ];
        break;
    case "it_IT":
        langShinko = [
            "Rovistamento di massa",
            "Seleziona i tipi da unit con cui rovistare",
            "Seleziona quali categorie utilizzare",
            "Inserisci la durata voluta dei rovistamenti in ORE",
            "Inserisci qui il tempo",
            "Calcola tempi per tutte le pagine",
            "Creatore: ",
            "Rovistamento di massa: manda su 50 villaggi",
            "Lancia gruppo"
        ];
        break;
}

// Carrega configurações do localStorage com defaults otimizados
let troopTypeEnabled = JSON.parse(localStorage.getItem("troopTypeEnabled")) || {};
const worldUnits = game_data.units.filter(unit => !["militia", "snob", "ram", "catapult", "spy", "knight"].includes(unit));
worldUnits.forEach(unit => {
    if (!troopTypeEnabled[unit]) troopTypeEnabled[unit] = false;
});
localStorage.setItem("troopTypeEnabled", JSON.stringify(troopTypeEnabled));

let keepHome = JSON.parse(localStorage.getItem("keepHome")) || {
    spear: 0, sword: 0, axe: 0, archer: 0, light: 0, marcher: 0, heavy: 0
};
localStorage.setItem("keepHome", JSON.stringify(keepHome));

let categoryEnabled = JSON.parse(localStorage.getItem("categoryEnabled")) || [true, true, true, true];
localStorage.setItem("categoryEnabled", JSON.stringify(categoryEnabled));

let prioritiseHighCat = JSON.parse(localStorage.getItem("prioritiseHighCat")) ?? false;
localStorage.setItem("prioritiseHighCat", JSON.stringify(prioritiseHighCat));

tempElementSelection = localStorage.getItem("timeElement") || "Date";
localStorage.setItem("timeElement", tempElementSelection);

let sendOrder = JSON.parse(localStorage.getItem("sendOrder")) || worldUnits;
localStorage.setItem("sendOrder", JSON.stringify(sendOrder));

let runTimes = JSON.parse(localStorage.getItem("runTimes")) || { off: 4, def: 3 };
localStorage.setItem("runTimes", JSON.stringify(runTimes));

let premiumBtnEnabled = false;

// URL para requisição
const sitterId = game_data.player.sitter > 0 ? `t=${game_data.player.id}&` : "";
const URLReq = `game.php?${sitterId}screen=place&mode=scavenge_mass`;

let arrayWithData;
let enabledCategories = [];
let squad_requests = [];
let squad_requests_premium = [];
let duration_factor = 0;
let duration_exponent = 0;
let duration_initial_seconds = 0;
const categoryNames = JSON.parse("[" + $.find('script:contains("ScavengeMassScreen")')[0].innerHTML.match(/\{.*\:\{.*\:.*\}\}/g) + "]")[0];

// Cores padrão (removidos temas extras para simplificar)
const backgroundColor = "#36393f";
const borderColor = "#3e4147";
const headerColor = "#202225";
const titleColor = "#ffffdf";
const cssClassesSophie = `
<style>
.sophRowA { background-color: #32353b; color: white; }
.sophRowB { background-color: #36393f; color: white; }
.sophHeader { background-color: #202225; font-weight: bold; color: white; }
.btnSophie { background-image: linear-gradient(#6e7178 0%, #36393f 30%, #202225 80%, black 100%); }
.btnSophie:hover { background-image: linear-gradient(#7b7e85 0%, #40444a 30%, #393c40 80%, #171717 100%); }
#x { position: absolute; background: red; color: white; top: 0px; right: 0px; width: 30px; height: 30px; }
#cog { position: absolute; background: #32353b; color: white; top: 0px; right: 30px; width: 30px; height: 30px; }
</style>`;

// Adiciona CSS
$("#contentContainer").eq(0).prepend(cssClassesSophie);
$("#mobileHeader").eq(0).prepend(cssClassesSophie);

// Função otimizada para carregar múltiplas URLs com delay
$.getAll = function (urls, onLoad, onDone, onError) {
    let numDone = 0;
    let lastRequestTime = 0;
    const minWaitTime = 200;
    loadNext();

    function loadNext() {
        if (numDone === urls.length) return onDone();

        const now = Date.now();
        const timeElapsed = now - lastRequestTime;
        if (timeElapsed < minWaitTime) return setTimeout(loadNext, minWaitTime - timeElapsed);

        $("#progress").css("width", `${(numDone + 1) / urls.length * 100}%`);
        lastRequestTime = now;
        $.get(urls[numDone]).done(data => {
            try {
                onLoad(numDone, data);
                numDone++;
                loadNext();
            } catch (e) {
                onError(e);
            }
        }).fail(xhr => onError(xhr));
    }
};

// Obtém dados do mundo e páginas
function getData() {
    $("#massScavengeSophie").remove();
    let URLs = [];
    $.get(URLReq, data => {
        const amountOfPages = $(".paged-nav-item").length > 0 ? parseInt($(".paged-nav-item").last().attr("href").match(/page=(\d+)/)[1]) : 0;
        for (let i = 0; i <= amountOfPages; i++) URLs.push(URLReq + "&page=" + i);

        const tempData = JSON.parse($(data).find('script:contains("ScavengeMassScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[0]);
        duration_exponent = tempData[1].duration_exponent;
        duration_factor = tempData[1].duration_factor;
        duration_initial_seconds = tempData[1].duration_initial_seconds;
    }).done(() => {
        arrayWithData = "[";
        $.getAll(URLs, (i, data) => {
            arrayWithData += $(data).find('script:contains("ScavengeMassScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[2] + ",";
        }, () => {
            arrayWithData = arrayWithData.slice(0, -1) + "]";
            scavengeInfo = JSON.parse(arrayWithData);
            let count = 0;
            scavengeInfo.forEach(village => {
                calculateHaulCategories(village);
                count++;
            });
            if (count === scavengeInfo.length) {
                let squads = {}, squads_premium = {}, per200 = 0, groupNumber = 0;
                squads[groupNumber] = []; squads_premium[groupNumber] = [];
                squad_requests.forEach((req, k) => {
                    if (per200 === 200) {
                        groupNumber++;
                        squads[groupNumber] = []; squads_premium[groupNumber] = [];
                        per200 = 0;
                    }
                    per200++;
                    squads[groupNumber].push(req);
                    squads_premium[groupNumber].push(squad_requests_premium[k]);
                });

                let htmlWithLaunchButtons = `<div id="massScavengeFinal" class="ui-widget-content" style="position:fixed;background-color:${backgroundColor};cursor:move;z-index:50;">
                    <button class="btn" id="x" onclick="closeWindow('massScavengeFinal')">X</button>
                    <table id="massScavengeSophieFinalTable" class="vis" border="1" style="width:100%;background-color:${backgroundColor};border-color:${borderColor}">
                        <tr><td colspan="10" style="text-align:center;background-color:${headerColor}"><h3><center style="margin:10px"><u><font color="${titleColor}">${langShinko[7]}</font></u></center></h3></td></tr>`;
                for (let s = 0; s < Object.keys(squads).length; s++) {
                    htmlWithLaunchButtons += `<tr id="sendRow${s}" style="text-align:center;background-color:${backgroundColor}"><td style="background-color:${backgroundColor}"><center><input type="button" class="btn btnSophie" onclick="sendGroup(${s},false)" value="${langShinko[8]}${s + 1}"></center></td><td style="background-color:${backgroundColor}"><center><input type="button" class="btn btn-pp btn-send-premium" style="display:none" onclick="sendGroup(${s},true)" value="${langShinko[8]}${s + 1} COM PREMIUM"></center></td></tr>`;
                }
                htmlWithLaunchButtons += "</table></div>";
                $(".maincell").eq(0).prepend(htmlWithLaunchButtons);
                $("#mobileContent").eq(0).prepend(htmlWithLaunchButtons);
                if (!isMobile) $("#massScavengeFinal").draggable();
                if (premiumBtnEnabled) $(".btn-send-premium").show();
                $("#sendMass")[0].focus();
            }
        }, error => console.error(error));
    });
}

// UI Principal (otimizada)
const html = `
<div id="massScavengeSophie" class="ui-widget-content" style="width:600px;background-color:${backgroundColor};cursor:move;z-index:50;">
    <button class="btn" id="cog" onclick="settings()">⚙️</button>
    <button class="btn" id="x" onclick="closeWindow('massScavengeSophie')">X</button>
    <table id="massScavengeSophieTable" class="vis" border="1" style="width:100%;background-color:${backgroundColor};border-color:${borderColor}">
        <tr><td colspan="10" style="text-align:center;background-color:${headerColor}"><h3><center style="margin:10px"><u><font color="${titleColor}">${langShinko[0]}</font></u></center></h3></td></tr>
        <tr style="background-color:${backgroundColor}"><td style="text-align:center;background-color:${headerColor}" colspan="15"><h3><center style="margin:10px"><u><font color="${titleColor}">${langShinko[1]}</font></u></center></h3></td></tr>
        <tr id="imgRow"></tr>
    </table>
    <hr>
    <table class="vis" border="1" style="width:100%;background-color:${backgroundColor};border-color:${borderColor}">
        <tr style="background-color:${backgroundColor}"><td style="text-align:center;background-color:${headerColor}" colspan="4"><h3><center style="margin:10px"><u><font color="${titleColor}">${langShinko[2]}</font></u></center></h3></td></tr>
        <tr id="categories" style="text-align:center;background-color:${headerColor}">
            <td style="background-color:${headerColor};padding:10px;"><font color="${titleColor}">${categoryNames[1].name}</font></td>
            <td style="background-color:${headerColor};padding:10px;"><font color="${titleColor}">${categoryNames[2].name}</font></td>
            <td style="background-color:${headerColor};padding:10px;"><font color="${titleColor}">${categoryNames[3].name}</font></td>
            <td style="background-color:${headerColor};padding:10px;"><font color="${titleColor}">${categoryNames[4].name}</font></td>
        </tr>
        <tr>
            <td style="text-align:center;background-color:${backgroundColor}"><center><input type="checkbox" id="category1"></center></td>
            <td style="text-align:center;background-color:${backgroundColor}"><center><input type="checkbox" id="category2"></center></td>
            <td style="text-align:center;background-color:${backgroundColor}"><center><input type="checkbox" id="category3"></center></td>
            <td style="text-align:center;background-color:${backgroundColor}"><center><input type="checkbox" id="category4"></center></td>
        </tr>
    </table>
    <hr>
    <table class="vis" border="1" style="width:100%;background-color:${backgroundColor};border-color:${borderColor}">
        <tr id="runtimesTitle" style="text-align:center;background-color:${headerColor}"><td colspan="3" style="background-color:${headerColor}"><center style="margin:10px"><font color="${titleColor}">${langShinko[3]}</font></center></td></tr>
        <tr id="runtimes" style="text-align:center;background-color:${headerColor}">
            <td style="background-color:${headerColor};"></td>
            <td style="background-color:${headerColor};padding:10px;"><font color="${titleColor}">Aldeias Off</font></td>
            <td style="background-color:${headerColor};padding:10px;"><font color="${titleColor}">Aldeias Def</font></td>
        </tr>
        <tr>
            <td style="width:22px;background-color:${backgroundColor};padding:5px;"><input type="radio" id="timeSelectorDate" name="timeSelector"></td>
            <td style="text-align:center;background-color:${backgroundColor};padding:5px;"><input type="date" id="offDay" value="${setDayToField(runTimes.off)}"><input type="time" id="offTime" value="${setTimeToField(runTimes.off)}"></td>
            <td style="text-align:center;background-color:${backgroundColor};padding:5px;"><input type="date" id="defDay" value="${setDayToField(runTimes.def)}"><input type="time" id="defTime" value="${setTimeToField(runTimes.def)}"></td>
        </tr>
        <tr>
            <td style="width:22px;background-color:${backgroundColor};padding:5px;"><input type="radio" id="timeSelectorHours" name="timeSelector"></td>
            <td style="text-align:center;background-color:${backgroundColor};padding:5px;"><input type="text" class="runTime_off" style="background-color:${backgroundColor};color:${titleColor};" value="${runTimes.off}" onclick="this.select();"></td>
            <td style="text-align:center;background-color:${backgroundColor};padding:5px;"><input type="text" class="runTime_def" style="background-color:${backgroundColor};color:${titleColor};" value="${runTimes.def}" onclick="this.select();"></td>
        </tr>
        <tr>
            <td style="width:22px;background-color:${backgroundColor};padding:5px;"></td>
            <td style="text-align:center;background-color:${backgroundColor};padding:5px;"><font color="${titleColor}"><span id="offDisplay"></span></font></td>
            <td style="text-align:center;background-color:${backgroundColor};padding:5px;"><font color="${titleColor}"><span id="defDisplay"></span></font></td>
        </tr>
    </table>
    <hr>
    <table class="vis" border="1" style="width:100%;background-color:${backgroundColor};border-color:${borderColor}">
        <tr id="settingPriorityTitle" style="text-align:center;background-color:${headerColor}"><td colspan="2" style="background-color:${headerColor}"><center style="margin:10px"><font color="${titleColor}">Qual configuração?</font></center></td></tr>
        <tr id="settingPriorityHeader" style="text-align:center;background-color:${headerColor}">
            <td style="width:50%;background-color:${headerColor};padding:5px;"><font color="${titleColor}">Balanceado em todas as categorias</font></td>
            <td style="width:50%;background-color:${headerColor};padding:5px;"><font color="${titleColor}">Prioridade em categorias mais altas</font></td>
        </tr>
        <tr id="settingPriority" style="text-align:center;background-color:${headerColor}">
            <td style="width:50%;background-color:${backgroundColor};padding:5px;"><input type="radio" id="settingPriorityBalanced" name="prio"></td>
            <td style="width:50%;background-color:${backgroundColor};padding:5px;"><input type="radio" id="settingPriorityPriority" name="prio"></td>
        </tr>
        <tr style="text-align:center;background-color:${headerColor}">
            <td style="width:50%;background-color:${backgroundColor};padding:5px;"><font color="${titleColor}">Configurações bugadas?</font></td>
            <td style="width:50%;background-color:${backgroundColor};padding:5px;"><center><input type="button" class="btn btnSophie" onclick="resetSettings()" value="Resetar configurações"></center></td>
        </tr>
    </table>
    <hr>
    <center><input type="button" class="btn btnSophie" onclick="readyToSend()" value="${langShinko[5]}"></center>
    <hr>
    <center><img id="sophieImg" title="Sophie -Shinko to Kuma-" src="https://dl.dropboxusercontent.com/s/bxoyga8wa6yuuz4/sophie2.gif" style="cursor:help;position:relative"></center>
    <br>
    <center><p><font color="${titleColor}">${langShinko[6]}</font><a href="https://shinko-to-kuma.my-free.website/" style="text-shadow:-1px -1px 0 ${titleColor},1px -1px 0 ${titleColor},-1px 1px 0 ${titleColor},1px 1px 0 ${titleColor};" title="Perfil de Sophie" target="_blank">Sophie "Shinko to Kuma"</a></p></center>
</div>
`;
$(".maincell").eq(0).prepend(html);
$("#mobileContent").eq(0).prepend(html);
if (game_data.locale === "ar_AE") $("#sophieImg").attr("src", "https://media2.giphy.com/media/qYr8p3Dzbet5S/giphy.gif");
if (!isMobile) $("#massScavengeSophie").css("position", "fixed").draggable();

$("#offDisplay").text(fancyTimeFormat(runTimes.off * 3600));
$("#defDisplay").text(fancyTimeFormat(runTimes.def * 3600));

if (tempElementSelection === "Date") {
    $("#timeSelectorDate").prop("checked", true);
    selectType("Date");
} else {
    $("#timeSelectorHours").prop("checked", true);
    selectType("Hours");
}
updateTimers();

// Event listeners otimizados
$("#offDay, #defDay, #offTime, #defTime, .runTime_off, .runTime_def").on("input", updateTimers);
$("#timeSelectorDate").on("input", () => { selectType('Date'); updateTimers(); });
$("#timeSelectorHours").on("input", () => { selectType('Hours'); updateTimers(); });

// Cria checkboxes para unidades
sendOrder.forEach(unit => {
    $("#imgRow").append(`<td align="center" style="background-color:${backgroundColor}">
        <table class="vis" border="1" style="width:100%">
            <tr><td style="text-align:center;background-color:${headerColor};padding:5px;"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_${unit}.png" title="${unit}" alt=""></td></tr>
            <tr><td align="center" style="background-color:${backgroundColor};padding:5px;"><input type="checkbox" id="${unit}"></td></tr>
            <tr><td style="text-align:center;background-color:#202225;padding:5px;"><font color="#ffffdf">Backup</font></td></tr>
            <tr><td align="center" style="background-color:${backgroundColor};padding:5px;"><input type="text" id="${unit}Backup" value="${keepHome[unit]}" size="5"></td></tr>
        </table>
    </td>`);
});
$("#imgRow").sortable({ axis: "x", revert: 100, containment: "parent", forceHelperSize: true, delay: 100, scroll: false }).disableSelection();

if (prioritiseHighCat) $("#settingPriorityPriority").prop("checked", true);
else $("#settingPriorityBalanced").prop("checked", true);

enableCorrectTroopTypes();

// Foco no botão de calcular
$("#sendMass").focus();

// Funções auxiliares (otimizadas)
function readyToSend() {
    if (!$("#settingPriorityPriority").is(":checked") && !$("#settingPriorityBalanced").is(":checked")) {
        alert("Você não escolheu como dividir as tropas! Escolha priorizar categorias altas ou balanceado.");
        return;
    }
    if (!$("#category1").is(":checked") && !$("#category2").is(":checked") && !$("#category3").is(":checked") && !$("#category4").is(":checked")) {
        alert("Você não escolheu categorias!");
        return;
    }

    sendOrder.forEach(unit => {
        troopTypeEnabled[unit] = $(`#${unit}`).is(":checked");
        keepHome[unit] = $(`#${unit}Backup`).val();
    });

    enabledCategories = [$("#category1").is(":checked"), $("#category2").is(":checked"), $("#category3").is(":checked"), $("#category4").is(":checked")];

    let time = { off: 0, def: 0 };
    if ($("#timeSelectorDate").is(":checked")) {
        localStorage.setItem("timeElement", "Date");
        time.off = (Date.parse($("#offDay").val().replace(/-/g, "/") + " " + $("#offTime").val()) - serverDate) / 3600000;
        time.def = (Date.parse($("#defDay").val().replace(/-/g, "/") + " " + $("#defTime").val()) - serverDate) / 3600000;
    } else {
        localStorage.setItem("timeElement", "Hours");
        time.off = $(".runTime_off").val();
        time.def = $(".runTime_def").val();
    }

    if (time.off > 24 || time.def > 24) alert("Duração maior que 24h!");

    prioritiseHighCat = $("#settingPriorityPriority").is(":checked");
    sendOrder = $("#imgRow :checkbox").map((_, el) => el.name).get();

    localStorage.setItem("troopTypeEnabled", JSON.stringify(troopTypeEnabled));
    localStorage.setItem("keepHome", JSON.stringify(keepHome));
    localStorage.setItem("categoryEnabled", JSON.stringify(enabledCategories));
    localStorage.setItem("prioritiseHighCat", JSON.stringify(prioritiseHighCat));
    localStorage.setItem("sendOrder", JSON.stringify(sendOrder));
    localStorage.setItem("runTimes", JSON.stringify(time));

    categoryEnabled = enabledCategories;
    getData();
}

function sendGroup(groupNr, premiumEnabled) {
    let actuallyEnabled = premiumEnabled ? confirm("Tem certeza de usar premium? Pode custar muito PP!") : false;
    const tempSquads = actuallyEnabled ? squad_requests_premium[groupNr] : squads[groupNr];

    $('[id^="sendMass"], [id^="sendMassPremium"]').prop('disabled', true);
    TribalWars.post('scavenge_api', { ajaxaction: 'send_squads' }, { squad_requests: tempSquads }, () => {
        UI.SuccessMessage("Grupo enviado com sucesso");
    });

    setTimeout(() => {
        $(`#sendRow${groupNr}`).remove();
        $('[id^="sendMass"], [id^="sendMassPremium"]').prop('disabled', false);
        $("#sendMass")[0].focus();
    }, 200);
}

function calculateHaulCategories(data) {
    if (!data.has_rally_point) return;

    const troopsAllowed = {};
    Object.keys(troopTypeEnabled).forEach(key => {
        if (troopTypeEnabled[key]) troopsAllowed[key] = Math.max(data.unit_counts_home[key] - keepHome[key], 0);
    });

    const unitType = { spear: 'def', sword: 'def', axe: 'off', archer: 'def', light: 'off', marcher: 'off', heavy: 'def' };
    let typeCount = { off: 0, def: 0 };
    Object.keys(troopsAllowed).forEach(prop => typeCount[unitType[prop]] += troopsAllowed[prop]);

    let totalLoot = 0;
    Object.keys(troopsAllowed).forEach(key => {
        const factors = { spear: 25, sword: 15, axe: 10, archer: 10, light: 80, marcher: 50, heavy: 50, knight: 100 };
        totalLoot += troopsAllowed[key] * (data.unit_carry_factor * (factors[key] || 0));
    });
    if (totalLoot === 0) return;

    const haul = parseInt((((typeCount.off > typeCount.def ? runTimes.off : runTimes.def) * 3600 / duration_factor - duration_initial_seconds) ** (1 / duration_exponent) / 100) ** (1 / 2));

    const haulCategoryRate = {};
    for (let i = 1; i <= 4; i++) {
        haulCategoryRate[i] = (data.options[i].is_locked || data.options[i].scavenging_squad) ? 0 : haul / (0.1 * i);
        if (!enabledCategories[i - 1]) haulCategoryRate[i] = 0;
    }

    const totalHaul = Object.values(haulCategoryRate).reduce((a, b) => a + b, 0);
    const unitsReadyForSend = calculateUnitsPerVillage(troopsAllowed, totalLoot, totalHaul, haulCategoryRate);

    Object.keys(unitsReadyForSend).forEach(k => {
        if (!data.options[parseInt(k) + 1].is_locked) {
            const candidate_squad = { unit_counts: unitsReadyForSend[k], carry_max: 9999999999 };
            squad_requests.push({ village_id: data.village_id, candidate_squad, option_id: parseInt(k) + 1, use_premium: false });
            squad_requests_premium.push({ ...squad_requests[squad_requests.length - 1], use_premium: true });
        }
    });
}

function enableCorrectTroopTypes() {
    worldUnits.forEach(unit => {
        if (troopTypeEnabled[unit]) $(`#${unit}`).prop("checked", true);
    });
    categoryEnabled.forEach((enabled, i) => {
        if (enabled) $(`#category${i + 1}`).prop("checked", true);
    });
}

function calculateUnitsPerVillage(troopsAllowed, totalLoot, totalHaul, haulCategoryRate) {
    const unitHaul = { spear: 25, sword: 15, axe: 10, archer: 10, light: 80, marcher: 50, heavy: 50, knight: 100 };
    const unitsReadyForSend = [{}, {}, {}, {}];

    if (totalLoot > totalHaul) {
        for (let j = 3; j >= 0; j--) {
            let reach = haulCategoryRate[j + 1];
            sendOrder.forEach(unit => {
                if (troopsAllowed[unit] && reach > 0) {
                    const amountNeeded = Math.floor(reach / unitHaul[unit]);
                    if (amountNeeded > troopsAllowed[unit]) {
                        unitsReadyForSend[j][unit] = troopsAllowed[unit];
                        reach -= troopsAllowed[unit] * unitHaul[unit];
                        troopsAllowed[unit] = 0;
                    } else {
                        unitsReadyForSend[j][unit] = amountNeeded;
                        reach = 0;
                        troopsAllowed[unit] -= amountNeeded;
                    }
                }
            });
        }
    } else {
        const troopNumber = Object.values(troopsAllowed).reduce((a, b) => a + b, 0);
        if (!prioritiseHighCat && troopNumber > 130) {
            for (let j = 0; j < 4; j++) {
                Object.keys(troopsAllowed).forEach(key => {
                    unitsReadyForSend[j][key] = Math.floor((totalLoot / totalHaul * haulCategoryRate[j + 1]) * (troopsAllowed[key] / totalLoot));
                });
            }
        } else {
            for (let j = 3; j >= 0; j--) {
                let reach = haulCategoryRate[j + 1];
                sendOrder.forEach(unit => {
                    if (troopsAllowed[unit] && reach > 0) {
                        const amountNeeded = Math.floor(reach / unitHaul[unit]);
                        if (amountNeeded > troopsAllowed[unit]) {
                            unitsReadyForSend[j][unit] = troopsAllowed[unit];
                            reach -= troopsAllowed[unit] * unitHaul[unit];
                            troopsAllowed[unit] = 0;
                        } else {
                            unitsReadyForSend[j][unit] = amountNeeded;
                            reach = 0;
                            troopsAllowed[unit] -= amountNeeded;
                        }
                    }
                });
            }
        }
    }
    return unitsReadyForSend;
}

function resetSettings() {
    ["troopTypeEnabled", "categoryEnabled", "prioritiseHighCat", "sendOrder", "runTimes", "keepHome"].forEach(key => localStorage.removeItem(key));
    UI.BanneredRewardMessage("Configurações resetadas");
    window.location.reload();
}

function closeWindow(title) {
    $("#" + title).remove();
}

function settings() {
    alert("Em breve!");
}

function zeroPadded(val) {
    return val >= 10 ? val : '0' + val;
}

function setTimeToField(runtime) {
    const d = new Date(serverDate + runtime * 3600000);
    return zeroPadded(d.getHours()) + ":" + zeroPadded(d.getMinutes());
}

function setDayToField(runtime) {
    const d = new Date(serverDate + runtime * 3600000);
    return d.getFullYear() + "-" + zeroPadded(d.getMonth() + 1) + "-" + zeroPadded(d.getDate());
}

function fancyTimeFormat(time) {
    if (time < 0) return "Tempo no passado!";
    const hrs = ~~(time / 3600);
    const mins = ~~((time % 3600) / 60);
    const secs = ~~(time % 60);
    let ret = "Duração máxima: ";
    if (hrs > 0) ret += hrs + ":" + (mins < 10 ? "0" : "");
    else ret += "0:" + (mins < 10 ? "0" : "");
    ret += mins + ":" + (secs < 10 ? "0" : "") + secs;
    return ret;
}

function updateTimers() {
    if ($("#timeSelectorDate").is(":checked")) {
        $("#offDisplay").text(fancyTimeFormat((Date.parse($("#offDay").val().replace(/-/g, "/") + " " + $("#offTime").val()) - serverDate) / 1000));
        $("#defDisplay").text(fancyTimeFormat((Date.parse($("#defDay").val().replace(/-/g, "/") + " " + $("#defTime").val()) - serverDate) / 1000));
    } else {
        $("#offDisplay").text(fancyTimeFormat($(".runTime_off").val() * 3600));
        $("#defDisplay").text(fancyTimeFormat($(".runTime_def").val() * 3600));
    }
}

function selectType(type) {
    const enableDate = type === 'Date';
    $("#offDay, #defDay, #offTime, #defTime").prop("disabled", !enableDate);
    $(".runTime_off, .runTime_def").prop("disabled", enableDate);
}
