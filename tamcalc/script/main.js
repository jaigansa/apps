const tamilNumbers = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];



let iodisplay = document.getElementById("io-display");
let distam = document.getElementById("tam-dis");


function display(num) {
    iodisplay.value += num;
    console.log("ok");
};

function clr() {
    iodisplay.value = "";
    distam.value = "";
};

function del() {
    iodisplay.value = iodisplay.value.slice(0, -1);
    distam.value = distam.value.slice(0,-1);
};

function calculate() {
    try {
        iodisplay.value = eval(iodisplay.value);
        // convert tamil numbers
        const number = parseInt(iodisplay.value);
        const tamilNumber = convertToTamilNumber(number);
        distam.value = tamilNumber;
    }
    catch (err) {
        alert("Invalid");
    }
};

function convertToTamilNumber(number) {
    const digits = number.toString().split("");
    const tamilDigits = digits.map(digit => tamilNumbers[parseInt(digit)]);
    return tamilDigits.join("");
}