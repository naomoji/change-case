// 转换为大写
const convertButton = document.getElementById("convertButton")
convertButton.addEventListener("click", function () {
    var inputText = document.getElementById("inputText").value;

    if (inputText.trim().length > 0) {
        var convertedText = formatText(inputText);
        document.getElementById("result").innerText = convertedText;
        updateResultHeight(); // 更新结果div的高度
        showMessage('转换成功')
    }
    else {
        showMessage('请输入文本后，再进行转换')
    }
});

// 配置需要特殊处理的词汇
const specialCases = {
    // 始终全大写
    preserveCase: ["BBQ", "NASA", "FBI"],
    // 首字母始终大写
    capitalizeAlways: ["I", "I'm", "I've", "I'd", "I'll", "Node.js"],
    // 专有名词 （单词 + 多词短语）
    properNouns:
        [
            // 星期、月份
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
            "Saturday", "Sunday",
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
            // 人名
            "John", "Mary", "Grace", "Ambrosius", "Emily",
            "Kevin", "Toby", "Cory", "Josh", "Chrissy",
            "Jack", "Steven", "Danya", "Van", "Vanessa", "Amber",
            "Ambrosius Vallin", "Kevin Archer", "Kev", "Adam",
            // 地名
            "New York", "Dante's Cove", "Dante's", "Hotel Dante",
            // 缩写
            "Dr", "Mr", "Mrs", "Ms", "Prof", "Ave", "St", "Rd",
            "a.m.", "p.m.", "etc.", "e.g.",    // 这行不生效
            // 其他
            "Voodoo Cults"

        ]
};

const sentenceCapitalizeRegex = /(^\s*\w|[.!?;:\]\}]\s*\w|\n\s*\w|\r\n\s*\w)/g;
// 匹配需要大写的首字母位置：
// 1. 行首空白后的第一个字母 (^\s*\w)
// 2. 标点符号后的第一个字母 ([.!?;:]\s*\w)
// 3. 换行符后的第一个字母 (\n\s*\w 或 \r\n\s*\w)

// 将特殊词汇放到 map中，方便后续转换，多词短语另外处理
const buildReplacements = () => {
    const replacements = new Map();

    [...specialCases.preserveCase,       // 始终全大写的词 
    ...specialCases.capitalizeAlways,   // 首字母始终大写的词 
    ...specialCases.properNouns.filter(phrase => !phrase.includes(' ')) // 单字专有名词
    ].forEach(word => {
        // 特殊单词的小写形式作为键，原始形式作为值
        replacements.set(word.toLowerCase(), word);
    });

    return replacements;
};

const replacements = buildReplacements();

// 对正则表达式中的特殊字符进行转义，如 node.js变成 node\.js
const escapedKeys = [...replacements.keys()]
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// \b 整词匹配，避免部分匹配 (如 "nasa"不会匹配 "NASAlab"或"NA")
// 表达式像这样 (nasa|i|kevin|monday)
// g：取所有匹配项，没有 g只去匹配到的第一项； i：匹配时忽略大小写
const wordRegex = new RegExp(`\\b(${escapedKeys.join('|')})\\b`, 'gi');

// 将特殊多词短语和对应的正则表达式放到 map，方便后续转换
const buildMultiWordRegexMap = () => {
    const map = new Map();
    
    specialCases.properNouns
        .filter(phrase => phrase.includes(' ')) // 只处理多词短语
        .forEach(phrase => {
            // 转义特殊字符并处理空格
            const escapedPhrase = phrase.toLowerCase()
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义正则特殊字符
                .replace(/\s+/g, '\\s+');               // 处理任意数量的空格

            // 多词短语的原本形式作为键，正则表达式作为值
            map.set(
                phrase,
                new RegExp(`\\b${escapedPhrase}\\b`, 'gi')
            );
        });
    
    return map;
};

const multiWordRegexMap = buildMultiWordRegexMap();

// 主文本格式化函数
function formatText(text) {
    // 1. 转为全小写，并将句子首字母大写
    text = text.toLowerCase()
        .replace(sentenceCapitalizeRegex, c => c.toUpperCase());

    // 2. 替换特殊单词
    text = text.replace(wordRegex, match =>
        // match是 text中满足 wordRegex的词
        replacements.get(match.toLowerCase())
    );

    // 3. 替换多词短语
    multiWordRegexMap.forEach((phraseRegex, phrase) => {
        text = text.replace(phraseRegex, phrase);
    });

    return text;
}

const inputArea = document.getElementById("inputText")
const resultDiv = document.getElementById('result');
const copyButton = document.getElementById('copyButton');
const topButton = document.getElementById('toTop');
const clearButton = document.getElementById("clearButton");

// 添加快捷键 Ctrl+Enter 执行转换
inputArea.addEventListener("keydown", function (event) {
    // 检查是否同时按下了 Ctrl键（或 Mac的 Command键）和 Enter键
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault(); // 阻止默认行为（换行）
        // 触发转换按钮的点击事件
        convertButton.click();
    }
});

// 复制结果
copyButton.addEventListener('click', function () {
    if (resultDiv.innerText.length > 0) {
        navigator.clipboard.writeText(resultDiv.innerText)
            .then(function () {
                // 提示复制成功
                showMessage('复制成功');
            }, function (err) {
                // console.error('复制失败:', err);
                // 失败用法二
                // 创建一个新的 textarea 元素，用于复制文本到剪贴板
                const textarea = document.createElement('textarea');
                textarea.value = resultDiv.innerText; // 设置 textarea 的值为结果 div 的文本内容
                document.body.appendChild(textarea); // 将 textarea 添加到文档中
                textarea.select(); // 选择 textarea 中的文本
                // textarea.setSelectionRange(0, textarea.value.length); // 选择 textarea 中，第 0~length 的文本
                document.execCommand('copy'); // 执行复制命令
                document.body.removeChild(textarea); // 移除 textarea 元素
                // 提示复制成功
                showMessage('复制成功');
            });
    }
    else {
        showMessage('请转换后再复制');
    }

});

// 清空输入的内容
clearButton.addEventListener("click", function () {
    document.getElementById("inputText").value = "";
});

// 平滑滚动到顶部
topButton.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // 兼容旧版浏览器的方式
    // window.scroll(0, 0);
});

//显示或隐藏“返回顶部”按钮
window.addEventListener('scroll', function () {
    // 当页面向下滚动超过250像素时显示按钮
    if (window.scrollY > 250) {
        document.querySelector('#toTop').style.display = 'block';
    } else {
        document.querySelector('#toTop').style.display = 'none'; // 否则隐藏按钮
    }
});

// 弹出消息
function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(function () {
        messageDiv.style.display = 'none';
    }, 2500); // 2.5秒后隐藏
}

// 更新结果div的高度
function updateResultHeight() {
    resultDiv.style.height = 'auto'; // 允许div根据内容自动调整高度

    // 计算div的scrollHeight（内容的实际高度）
    const textHeight = resultDiv.scrollHeight;

    // 只有当内容高度超过150px时才更新div的高度
    if (textHeight > 150) {
        resultDiv.style.height = textHeight + 'px';
    } else {
        resultDiv.style.height = '150px'; // 否则保持高度为150px
    }
}




