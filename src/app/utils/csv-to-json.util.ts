const separator = '\t';

export const csvToJson = (value: string): any => {
  if (!value) return '';

  const lines = value.split('\r\n');
  const header = lines[0].split(separator);
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentLine: string[] = lines[i].split(separator);

    for (let j = 0; j < header.length; j++) {
      obj[header[j].trim()] = currentLine[j] ? currentLine[j].trim() : '';
    }

    result.push(obj);
  }

  const jsonString = JSON.stringify(result);

  return JSON.parse(jsonString);
};
