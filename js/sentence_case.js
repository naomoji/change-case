// 转换为大写
document.getElementById("convertButton").addEventListener("click", function () {
    var inputText = document.getElementById("inputText").value;

    if (inputText.trim().length > 0) {
        var convertedText = formatText(inputText);
        document.getElementById("result").innerText = convertedText;
        updateResultHeight(); // 更新结果div的高度
    }
    else {
        showMessage('请输入文本后，再进行转换')
    }
});

// 配置需要特定处理规则的词汇
const specialCases = {
    // 始终全大写
    preserveCase: ["BBQ", "NASA", "FBI"],
    // 首字母始终大写
    capitalizeAlways: ["I", "I'm", "I've", "I'd", "I'll"],
    // 专有名词
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
            "Jack", "Steven","Danya","Van","Vanessa",
            "Ambrosius Vallin","Kevin Archer",
            // 地名
            "New York","Dante's Cove","Dante's","Hotel Dante",
            // 其他
            "Voodoo Cults"
        ]
};

// 句子首字母转为大写
function formatText(text) {
    // 1. 句子中所有字母都转为小写
    text = text.toLowerCase();
    
    // 2. 句子首字母再转为大写
    // 定位到 句子开头、标点符号之后、换行之前
    text = text.replace(/(^\s*\w|[.!?;:]\s*\w|\n\s*\w|\r\n\s*\w)/g, c => c.toUpperCase());
    
    // 3. 将特殊词汇存到 map中，方便后续替换
    const replacements = new Map();
    
    // 将特殊词汇的小写形式设置为键，原本形式设置为值
    // 始终全大写的词
    specialCases.preserveCase.forEach(word => 
        replacements.set(word.toLowerCase(), word));

    // 首字母始终大写
    specialCases.capitalizeAlways.forEach(word => 
        replacements.set(word.toLowerCase(), word));

    //一个单词组成的专有名词
    const singleWords = specialCases.properNouns
        .filter(phrase => !phrase.includes(' '));

    singleWords.forEach(word => 
        replacements.set(word.toLowerCase(), word));
    
    //正则表达 (i|nasa|bbq|monday|new york)
    const wordRegex = new RegExp(
        `\\b(${[...replacements.keys()].join('|')})\\b`,'gi'
    );
    
    // 替换特殊词汇
    text = text.replace(wordRegex, (match) => {
        const lowerMatch = match.toLowerCase();
        return replacements.has(lowerMatch) ? replacements.get(lowerMatch) : match;
    });

    // 单独处理由多个单词组成的专有名词
    const multiWordPhrases = specialCases.properNouns
        .filter(phrase => phrase.includes(' '))
        .sort((a, b) => b.length - a.length); // 长的优先
    
    multiWordPhrases.forEach(phrase => {
        const lowerPhrase = phrase.toLowerCase();
        // 使用非单词边界断言确保完整匹配
        // (?=\\s|$) 正向先行断言，后面必须是空格或结尾
        const regex = new RegExp(`(^|\\s)${lowerPhrase.replace(/\s+/g, '\\s+')}(?=\\s|$)`, 'gi');
        text = text.replace(regex, (match, p1) => p1 + phrase);
    });
    
    return text;
}

const resultDiv = document.getElementById('result');
const copyButton = document.getElementById('copyButton');
const topButton = document.getElementById('toTop');
const clearButton = document.getElementById("clearButton");

// 复制结果
copyButton.addEventListener('click', function() {
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
topButton.addEventListener('click', function() {
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




