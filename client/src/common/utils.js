const formatPrice = (price) => {
    // Check for prices ending with 1 or 6
    if (price % 10 === 1 || price % 10 === 6 || price % 10 === 9) {
      return `$${price - 1}+`;
    }
  
    // Check for 4-digit prices (e.g., 1020)
    if (price >= 1000) {
      const low = Math.floor(price / 100);
      const high = price % 100;
      return `$${low} - ${high}`;
    }
  
    // Default formatting
    return `$${price}`;
  };

  export default formatPrice