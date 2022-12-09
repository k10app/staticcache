var fs = require('fs')

//copy from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//copy from https://gist.github.com/mjackson/5311256
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
  
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
  
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
  
    return [ h, s, l ];
}

function hslToRgb(h, s, l) {
    var r, g, b;
  
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
  
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
  
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
  
    return [ r * 255, g * 255, b * 255 ];
}

function darken(hex,mod) {
    
    var rrgb = hexToRgb(hex)
    var rhsl = rgbToHsl(rrgb.r,rrgb.g,rrgb.b)
    
    var modres = Math.min(Math.max(rhsl[2]+mod,0),1)

    var xrgb = hslToRgb(rhsl[0],rhsl[1],modres)
    var result = rgbToHex(Math.round(xrgb[0]),Math.round(xrgb[1]),Math.round(xrgb[2]))

    //console.log(hex,rrgb,rhsl,modres,xrgb,result)

    return result
}

//from https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function minDark(hex,minDark) {
    
    var rrgb = hexToRgb(hex)
    var rhsl = rgbToHsl(rrgb.r,rrgb.g,rrgb.b)
    
    var modres = Math.min(Math.max(rhsl[2],0),minDark)

    var xrgb = hslToRgb(rhsl[0],rhsl[1],modres)
    var result = rgbToHex(Math.round(xrgb[0]),Math.round(xrgb[1]),Math.round(xrgb[2]))

    //console.log(hex,rrgb,rhsl,modres,xrgb,result)

    return result
}




var tf = (n,v) => { return {"n":n,"v":v}}
var targets = [
    tf("orange","#ff8811"),
    tf("yellow","#ebf949"),
    tf("purple","#7000ff"),
    tf("bordeaux","#c2095a"),
    tf("turquoise","#00999a"),
    tf("darkpurple","#302e47"),
]

var catalog = []

var imghtml = ["<html><body>"]
function imgpush(fname,data) {
    imghtml.push("<img src='"+fname+"'/>")
    fs.writeFileSync(fname,data)
}

// Cups
function pushCatalog(name,description,p,filePath) {
    catalog.push(
        {
            "name": name,
            "description": description,
            "price": p,
            "imgurl": "/static/"+filePath,
            "stock": parseInt(Math.random()*8000+2000),
        }
    )
}

var mug = fs.readFileSync("../src/static-mug-export-plain.svg")
imgpush("static-mug-export-plain.svg",mug)
var replaceMe = [
    "#141414",//maincup
    "#222222",//linecup
    "#1f1f1f",//innerringlinecup
]
pushCatalog("Grey"+" Mug","This is a "+"grey"+" mug. Keeps you drinking coffee all day",3,"static-mug-export-plain.svg")

targets.forEach(t=>{
    var cpy = ""+mug

    cpy = cpy.replaceAll(replaceMe[0],t.v)
    cpy = cpy.replaceAll(replaceMe[1],darken(t.v,-0.05))
    cpy = cpy.replaceAll(replaceMe[2],darken(t.v,-0.1))
    
    var fname = "static-mug-export-"+t.n+".svg"
    pushCatalog(t.n.toProperCase()+" Mug","This is a "+t.n+" mug. Keeps you drinking coffee all day",3,fname)
    imgpush(fname,cpy)
    
})

// Stickers

var sticker = fs.readFileSync("../src/static-sticker-export-plain.svg")
imgpush("static-sticker-export-plain.svg",sticker)

pushCatalog("Grey"+" Sticker","This is a "+"grey"+" sticker. Stick it everywhere!",1,"static-sticker-export-plain.svg")

targets.forEach(t=>{
    var cpy = ""+sticker

    cpy = cpy.replaceAll("#2600ff",minDark(t.v,0.45))

    
    var fname = "static-sticker-export-"+t.n+".svg"
    pushCatalog(t.n.toProperCase()+" Sticker","This is a "+t.n+" sticker. Stick it everywhere!",1,fname)
    imgpush(fname,cpy)
    
})

// tshirts
var nt = "static-tshirt-export"
var svgt = fs.readFileSync("../src/"+nt+"-plain.svg")
imgpush(nt+"-plain.svg",svgt)
pushCatalog("Grey"+" Shirt","This is a "+"grey"+" shirt. Wear it any time!",10,nt+"-plain.svg")


targets.forEach(t=>{
    var cpy = ""+svgt

    cpy = cpy.replaceAll("#222222",t.v)
    cpy = cpy.replaceAll("#090909",darken(t.v,-0.3))
    
    var fname = nt+"-"+t.n+".svg"
    pushCatalog(t.n.toProperCase()+" Shirt","This is a "+t.n+" shirt.  Wear it any time!",10,fname)
    imgpush(fname,cpy)
    
})


imghtml.push("</body></html>")

fs.writeFileSync("imagen.html",imghtml.join("\n"))
fs.writeFileSync("catalog.json",JSON.stringify(catalog,null,2))