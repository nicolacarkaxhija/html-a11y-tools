import { describe, it } from 'vitest';
import rule from '../../lib/rules/button-name.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('button-name', () => {
  it('requires buttons to have a discernible accessible name', () => {
    ruleTester.run('html-a11y/button-name', rule, {
      valid: [
        { code: '<button>Submit</button>' },
        { code: '<button aria-label="Close dialog">×</button>' },
        { code: '<button aria-labelledby="btn-label">x</button>' },
        { code: '<button><span class="icon"></span><span class="sr-only">Search</span></button>' },
        { code: '<button>__CONTENT__</button>' },
        { code: '<button aria-hidden="true"></button>' },
        { code: '<button aria-label="__DYNAMIC__">x</button>' },
      ],
      invalid: [
        {
          code: '<button></button>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<button>   </button>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<button><span></span></button>',
          errors: [{ messageId: 'missingName' }],
        },
      ],
    });
  });
});
