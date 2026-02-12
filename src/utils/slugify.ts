import slugify from 'slugify';

export const slugifyText = (text: string) => {
    return slugify(text, {
        replacement: '-',
        remove: /[^a-zA-Z0-9\s]/g,
        lower: true,
        strict: true,
        locale: 'vi',
    });
};
