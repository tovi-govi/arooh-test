import fs from 'fs';
import opentype from 'opentype.js';

function reverseCommands(commands) {
  const paths = [];
  let path;
  commands.forEach((c) => {
    if (c.type.toLowerCase() === 'm') {
      path = [c];
      paths.push(path);
    } else if (c.type.toLowerCase() !== 'z') {
      path.push(c);
    }
  });

  const reversed = [];
  paths.forEach((p) => {
    const result = {
      type: 'm',
      x: p[p.length - 1].x,
      y: p[p.length - 1].y,
    };
    reversed.push(result);
    for (let i = p.length - 1; i > 0; i--) {
      const command = p[i];
      const res = { type: command.type };
      if (command.x2 !== undefined && command.y2 !== undefined) {
        res.x1 = command.x2;
        res.y1 = command.y2;
        res.x2 = command.x1;
        res.y2 = command.y1;
      } else if (command.x1 !== undefined && command.y1 !== undefined) {
        res.x1 = command.x1;
        res.y1 = command.y1;
      }
      res.x = p[i - 1].x;
      res.y = p[i - 1].y;
      reversed.push(res);
    }
  });
  return reversed;
}

function convert(font, reversed = true) {
  const round = Math.round;
  const glyphs = {};
  const scale = 100000 / ((font.unitsPerEm || 2048) * 72);

  const glyphIndexMap = font.encoding.cmap.glyphIndexMap;
  const unicodes = Object.keys(glyphIndexMap);

  for (let i = 0; i < unicodes.length; i++) {
    const unicode = unicodes[i];
    const glyph = font.glyphs.glyphs[glyphIndexMap[unicode]];

    if (unicode !== undefined && glyph && glyph.path) {
      const token = {
        ha: round((glyph.advanceWidth || 0) * scale),
        x_min: round((glyph.xMin || 0) * scale),
        x_max: round((glyph.xMax || 0) * scale),
        o: '',
      };

      let cmds = glyph.path.commands;
      if (reversed) {
        cmds = reverseCommands(cmds);
      }

      cmds.forEach((command) => {
        let type = command.type.toLowerCase();
        if (type === 'c') type = 'b';
        token.o += type + ' ';
        if (command.x !== undefined && command.y !== undefined) {
          token.o += round(command.x * scale) + ' ' + round(command.y * scale) + ' ';
        }
        if (command.x1 !== undefined && command.y1 !== undefined) {
          token.o += round(command.x1 * scale) + ' ' + round(command.y1 * scale) + ' ';
        }
        if (command.x2 !== undefined && command.y2 !== undefined) {
          token.o += round(command.x2 * scale) + ' ' + round(command.y2 * scale) + ' ';
        }
      });

      if (Array.isArray(glyph.unicodes) && glyph.unicodes.length > 0) {
        glyph.unicodes.forEach((u) => {
          glyphs[String.fromCodePoint(u)] = token;
        });
      } else if (glyph.unicode) {
        glyphs[String.fromCodePoint(glyph.unicode)] = token;
      } else {
        glyphs[String.fromCodePoint(Number(unicode))] = token;
      }
    }
  }

  return {
    glyphs,
    familyName: font.getEnglishName('fullName') || font.names.fontFamily?.en || 'AvQest',
    ascender: round(font.ascender * scale),
    descender: round(font.descender * scale),
    underlinePosition: font.tables.post ? font.tables.post.underlinePosition : -100,
    underlineThickness: font.tables.post ? font.tables.post.underlineThickness : 50,
    boundingBox: {
      xMin: font.tables.head ? font.tables.head.xMin : -500,
      xMax: font.tables.head ? font.tables.head.xMax : 1500,
      yMin: font.tables.head ? font.tables.head.yMin : -500,
      yMax: font.tables.head ? font.tables.head.yMax : 1500,
    },
    resolution: 1000,
    original_font_information: font.tables.name,
  };
}

const fileBuf = fs.readFileSync('client/public/fonts/AvQest.ttf');
const arrayBuffer = fileBuf.buffer.slice(fileBuf.byteOffset, fileBuf.byteOffset + fileBuf.byteLength);
const font = opentype.parse(arrayBuffer);
console.log('Font loaded:', font.names.fontFamily);
const typeface = convert(font, true);
fs.writeFileSync('client/public/fonts/avqest.json', JSON.stringify(typeface));
console.log('Successfully generated client/public/fonts/avqest.json!');
