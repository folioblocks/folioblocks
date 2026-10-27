/** Keep the same edge when switching between side-by-side and stacked images. */
export const getBeforeAfterLabelPosition = ( orientation, position = 'center' ) => {
    const positions = orientation === 'vertical'
        ? { top: 'left', bottom: 'right', left: 'left', right: 'right', center: 'center' }
        : { left: 'top', right: 'bottom', top: 'top', bottom: 'bottom', center: 'center' };
    return positions[ position ] || 'center';
};
