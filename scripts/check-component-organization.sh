#!/bin/bash

echo "🔍 Checking Component Organization..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if components/ui/ contains only shadcn components
echo -e "${BLUE}Checking /components/ui/ directory...${NC}"

SHADCN_COMPONENTS=(
  "accordion"
  "alert"
  "avatar"
  "badge"
  "button"
  "card"
  "checkbox"
  "dropdown-menu"
  "input"
  "label"
  "separator"
  "sheet"
  "skeleton"
  "tooltip"
  "sidebar"
)

# Check for files that shouldn't be in ui/
MISPLACED_FOUND=false
if [ -d "components/ui" ]; then
  for file in components/ui/*.tsx; do
    if [ -f "$file" ]; then
      filename=$(basename "$file" .tsx)
      
      # Check if this is a known shadcn component
      is_shadcn=false
      for shadcn_comp in "${SHADCN_COMPONENTS[@]}"; do
        if [ "$filename" = "$shadcn_comp" ]; then
          is_shadcn=true
          break
        fi
      done
      
      if [ "$is_shadcn" = false ]; then
        echo -e "${RED}❌ Misplaced component: $file${NC}"
        echo -e "   ${YELLOW}→ Should be moved to components/$filename.tsx${NC}"
        MISPLACED_FOUND=true
      fi
    fi
  done
fi

if [ "$MISPLACED_FOUND" = false ]; then
  echo -e "${GREEN}✅ All components in ui/ are properly placed${NC}"
fi

# Check for incorrect import paths
echo -e "\n${BLUE}Checking for incorrect import paths...${NC}"

INCORRECT_IMPORTS_FOUND=false

# Check for relative imports to ui/
if grep -r "from.*\.\./ui/" app/ components/ 2>/dev/null; then
  echo -e "${RED}❌ Found relative imports to ui/ directory${NC}"
  echo -e "   ${YELLOW}→ Use absolute imports: @/components/ui/component${NC}"
  INCORRECT_IMPORTS_FOUND=true
fi

# Check for imports of moved components from ui/
MOVED_COMPONENTS=("database-status")
for comp in "${MOVED_COMPONENTS[@]}"; do
  if grep -r "from.*@/components/ui/$comp" app/ components/ 2>/dev/null; then
    echo -e "${RED}❌ Found incorrect import: @/components/ui/$comp${NC}"
    echo -e "   ${YELLOW}→ Should be: @/components/$comp${NC}"
    INCORRECT_IMPORTS_FOUND=true
  fi
done

if [ "$INCORRECT_IMPORTS_FOUND" = false ]; then
  echo -e "${GREEN}✅ All import paths are correct${NC}"
fi

# Check component naming conventions
echo -e "\n${BLUE}Checking naming conventions...${NC}"

NAMING_ISSUES_FOUND=false

# Check for non-kebab-case file names
for file in components/*.tsx components/ui/*.tsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .tsx)
    
    # Check if filename contains uppercase or underscores
    if [[ "$filename" =~ [A-Z_] ]]; then
      echo -e "${YELLOW}⚠️  Non-kebab-case filename: $file${NC}"
      echo -e "   ${YELLOW}→ Consider renaming to use kebab-case${NC}"
      NAMING_ISSUES_FOUND=true
    fi
  fi
done

if [ "$NAMING_ISSUES_FOUND" = false ]; then
  echo -e "${GREEN}✅ All file names follow kebab-case convention${NC}"
fi

# Summary
echo -e "\n${BLUE}Summary:${NC}"
echo "========"

if [ "$MISPLACED_FOUND" = false ] && [ "$INCORRECT_IMPORTS_FOUND" = false ] && [ "$NAMING_ISSUES_FOUND" = false ]; then
  echo -e "${GREEN}🎉 Component organization is perfect!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some issues found. Please review and fix the items above.${NC}"
  exit 1
fi
