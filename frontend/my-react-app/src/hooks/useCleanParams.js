export const useCleanParams = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );
