export function getTruthIndexColor(index){
    if (index >= 80) return "text-green-600 bg-green-100";
    if (index >= 60) return "text-yellow-600 bg-yellow-100";
    if (index >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
}

export function  getVerdictColor(verdict) {
    switch (verdict) {
        case "True": case "Verified": return "text-green-600 bg-green-100";
        case "False": case "Debunked": return "text-red-600 bg-red-100";
        default: return "text-yellow-600 bg-yellow-100";
    }
}