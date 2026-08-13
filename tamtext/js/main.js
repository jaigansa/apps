/*
Tamil Character translation 
Unicode to Different fonts support Characters.
This code written by jaigansa.
Permission liciense CC BY-NC-SA
*/

/*
 _____   _     __  __            ____        _   _ 
|_   _| / \   |  \/  |          / ___| ___  | \ | |
  | |  / _ \  | |\/| |  _____  | |    / _ \ |  \| |
  | | / ___ \ | |  | | |_____| | |___| (_) || |\  |
  |_|/_/   \_\|_|  |_|          \____|\___/ |_| \_|

*/
console.log("TAMIL - TRAN");

// bamini converter ...

function getbamini() {
    var usrdata = document.getElementById("sourceText").value;
    var clear = '';
    document.getElementById("targetText").innerHTML = clear;
    var prodata = UniBamini(usrdata);
};

function gettscii() {
    var usrdata = document.getElementById("sourceText").value;
    var clear = '';
    document.getElementById("targetText").innerHTML = clear;
    var prodata = UniTscii(usrdata);
};

function gettab() {
    var usrdata = document.getElementById("sourceText").value;
    var clear = '';
    document.getElementById("targetText").innerHTML = clear;
    var prodata = UniTab(usrdata);
};

// clear data ...

function cleardata() {
    var clear = '';
    document.getElementById("targetText").innerHTML = clear;
}

// copy data ...

function copydata() {
    var copyText = document.getElementById("targetText");
    copyText.select();
    //copyText.setSelectionRange(0, 99999) //for mobile
    document.execCommand("copy");
    alert("Copied the text: " + copyText.value);
}

// Reset all data ...

function resetdata() {
    var clear = '';
    document.getElementById("targetText").innerHTML = clear;
    document.getElementById("sourceText").innerHTML = clear;


}