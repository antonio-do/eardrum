const messages = {
  compliance: {
    a: {
      name: 'Brokerage Account Disclosure',
      path: 'brokerage-account-disclosure',
      shortName: 'BAD',
      text: {
        overview:
          'Every employee must disclose to the CCO any and all brokerage accounts in the name of the employee, over which the employee exercises discretion (expressor or in fact) or in which the employee has an interest.',
        list: {
          tile: 'Disclosure is not required for any account:',
          items: [
            'over which the employee has no control or discretionary trading authority (including Managed Accounts), or',
            'used exclusively for trading in commodities and futures contracts and do not have discretionary brokerage capability for individual securities; or',
            'that is limited to exempted securities such as bank certificates of deposit, open-end mutual fund shares, and Treasury obligations, and does not have discretionary brokerage capability for individual securities (e.g., 529 and 401(k) accounts).',
          ],
        },
        radioGroup: {
          title: 'Please check one of the following and sign below:',
          option1:
            'I do not have any accounts that must be disclosed. I agree to notify the CCO prior to any such account being opened in the future.',
          option2: {
            content:
              'Set forth below is a complete list of all accounts that must be disclosed (use additional forms if necessary).',
            note:
              'The CCO will be sending a letter requesting duplicate confirms and statements for each of the accounts disclosed below.',
          },
        },
        formTitles: ['Name of Firm Where Account is Held', 'Name on Account', 'Account Number'],
        agreeToPolicy:
          'I have read and understand the Personal Securities Trading Policies referenced in the Code of Ethics and Compliance Manual, and I agree to abide by such policies during the term of my employment.',
      },
    },
    b: {
      name: 'Employee Securities Holdings Report',
      path: 'employee-security-holdings-report',
      shortName: 'ESHR',
      text: {
        yearSelectTitle: 'As of:',
        radioGroup: {
          title: 'I hereby declare that:',
          option1: 'I do not have any reportable brokerage accounts.',
          option2: {
            content: 'I have reported all reportable holdings in my personal brokerage accounts.',
            note: 'Please submit your annual statement(s) from each reportable brokerage account.',
          },
        },
      },
    },
    c: {
      name: 'Employee Quarterly Trade Report',
      path: 'employee-quarterly-trade-report',
      shortName: 'EQTR',
      text: {
        title: 'I declare that:',
        quarterYearSelectTitle: 'As of the end of',
        box1: {
          title: 'I hereby declare that (tickbox):',
          radioGroupTitles: [
            'I have not engaged in personal account deadling',
            'I have engaged in personal account deadling, not exceeding the limit of S$10,000 (ten thousand)',
            'I have engaged in personal account deadling, and obtained prior approval to trade on a single stock on the same day (i.e 24 hours) for an amount exceeding S$10,000 (ten thousand)',
          ],
          lastRadioItemNote:
            'Comple the details below in case of personal account deadling on a single stock on the same day and exceeding the amount of S$10,000 (ten thousand):',
        },
        box2: {
          title: 'I hereby confirm that:',
          checkboxGroupTitles: [
            'My personal dealing activities and those of any Related Persons are in accordance with the Rules set out in this Manual',
            'To the best of my knowledge, my personal dealing activities will not raise any conflict of interest with the Company or any of its clients',
            'I am not aware of any pending client order, current or upcoming client soliciation, in relation to my personal deadling activities',
            'My personal deadling activities do not breach any relevant holding or blackout period by the Manual',
          ],
        },
      },
    },
    d: {
      name: 'Request for Pre-Clearance of Securities Trade',
      path: 'request-for-pre-clearance-of-securities-trade',
      shortName: 'RPST',
      text: {
        list: {
          title: 'The Employee submitting this request understands and specifically represents as follows:*',
          items: [
            'I have no inside information relating to the above-referenced issuer(s);',
            'I have not had any contact or communication with the issuer(s) in the last six months;',
            'I am not aware of any conflict of interest this transaction may cause with respect to any Client account and I am not aware of any Client account trading activity that may have occurred in the issuers of the above referenced securities during the past four trading days or that may now or in the near future be contemplated;',
            'If approval is granted, it is only good for one day and specifically the day it was approved (e.g., expiring at midnight on the day of approval); and',
            'The securities are not being purchased in an initial public offering or private placement.',
          ],
        },
        note:
          'If for any reason an employee cannot make the above required representations or has any questions in this area, the employee MUST contact the CCO before submitting any request for approval.',
      },
    },
  },
}

export default messages
