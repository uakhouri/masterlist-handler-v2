const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  BorderStyle
} = require('docx');

function label(text) {
  return new TextRun({ text: `${text}: `, bold: true });
}

function bulletList(items) {
  if (!items?.length) {
    return [new Paragraph({ text: 'Not specified.', italics: true, spacing: { after: 120 } })];
  }
  return items.map(
    (item) => new Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 60 } })
  );
}

function trialSection(trial) {
  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      spacing: { before: 320, after: 80 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' }
      },
      children: [
        new TextRun({ text: `${trial.nct} — `, bold: true, size: 24 }),
        new TextRun({ text: trial.title || 'Untitled trial', size: 24 })
      ]
    })
  );

  paragraphs.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [label('Phase'), new TextRun(trial.phase || 'N/A')]
    })
  );
  paragraphs.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [label('Study type'), new TextRun(trial.study_type || 'N/A')]
    })
  );
  paragraphs.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [label('Sponsor'), new TextRun(trial.sponsor || 'N/A')]
    })
  );

  if (trial.url) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          label('Link'),
          new ExternalHyperlink({
            link: trial.url,
            children: [new TextRun({ text: trial.url, style: 'Hyperlink' })]
          })
        ]
      })
    );
  }

  paragraphs.push(new Paragraph({ text: 'Locations', heading: HeadingLevel.HEADING_3, spacing: { before: 120, after: 60 } }));
  paragraphs.push(...bulletList(trial.location));

  paragraphs.push(new Paragraph({ text: 'Inclusion criteria', heading: HeadingLevel.HEADING_3, spacing: { before: 120, after: 60 } }));
  paragraphs.push(...bulletList(trial.inclusion_criteria));

  paragraphs.push(new Paragraph({ text: 'Exclusion criteria', heading: HeadingLevel.HEADING_3, spacing: { before: 120, after: 60 } }));
  paragraphs.push(...bulletList(trial.exclusion_criteria));

  return paragraphs;
}

/**
 * Builds a .docx buffer summarizing a masterlist and all of its trials.
 */
async function buildMasterlistDocx(masterlist) {
  const children = [
    new Paragraph({ text: masterlist.name, heading: HeadingLevel.TITLE, spacing: { after: 120 } }),
    new Paragraph({
      spacing: { after: 60 },
      children: [label('Cancer type'), new TextRun(masterlist.cancerType || 'N/A')]
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [label('Trials'), new TextRun(String(masterlist.trials.length))]
    })
  ];

  masterlist.trials.forEach((trial) => {
    children.push(...trialSection(trial));
  });

  const doc = new Document({
    sections: [{ children }]
  });

  return Packer.toBuffer(doc);
}

module.exports = { buildMasterlistDocx };
